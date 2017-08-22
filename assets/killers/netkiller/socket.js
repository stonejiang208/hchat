/**
 * Created by zxh on 15/11/10.
 */

let Emitter = require('../../libs/emitter.js');
let pbkiller = require('../pbkiller/src/pbkiller');
pbkiller.init();

/**
 * Socket通信类,封装websocket与Proto
 * @param host
 * @constructor
 */
let Socket = function() {
    this.taskQueue = {};
    this.waitQueue = [];
    this.playerId = null;
    this.sequence = 0;
    this.serverTime = 0;
};

Socket.prototype.connect = function(host) {
    this.host = host;
    let ws = new WebSocket(host);
    ws.binaryType = "arraybuffer";

    //绑定事件
    ws.onopen = this.onopen.bind(this);
    ws.onmessage = this.onmessage.bind(this);
    ws.onclose = this.onclose.bind(this);
    ws.onerror = this.onerror.bind(this);

    this.ws = ws;
    this.status = 'connecting';
};

/**
 *定义socket事件
 */
Socket.Event = {
    //websocket事件
    ON_SOCKET_OPEN: 'on_socket_open',
    ON_SOCKET_ERROR: 'on_socket_error',
    ON_SOCKET_CLOSED: 'on_socket_closed',
    ON_SOCKET_MESSAGE: 'on_socket_message',

    //自定义事件
    ON_PRE_REQUEST: 'on_pre_request',           //发起请求前
    ON_MESSAGE_ERROR: 'on_message_error',       //消息错误
    ON_END_REQUEST: 'on_end_request',           //发起请求并处理完成

    ON_PUSH_MESSAGE : 'on_push_message',        //推送消息
    ON_PUSH_MESSAGE_END: 'ON_PUSH_MESSAGE_END'  //推送消息结束

};

//为Socket类绑定Emitter能力,可以发送事件
Emitter(Socket.prototype);

/**
 * websocket连接成功事件
 * @param event
 */
Socket.prototype.onopen = function(event) {
    this.status = 'connected';

    //将等待队列中的数据,发送出去
    //this.waitQueue.forEach(function(requestData) {
    //    this.taskQueue[requestData.sequence] = requestData;
    //    this.ws.send(requestData.data);
    //}, this);

    this.waitQueue = [];
    this.emit(Socket.Event.ON_SOCKET_OPEN);
};

//处理错误
Socket.prototype.handleError = function(msg, task, e) {
    if (msg.error > 0 || e) {
        this.emit(Socket.Event.ON_MESSAGE_ERROR, msg.error);
        if (task && task.error) {
            try{
                task.error.call(task.target, msg.error, e);        
            } catch(e) {
                cc.log(e.message);
            }
        }
        return;
    }
};

/**
 * websocket有消息到达事件
 * @param event
 */
Socket.prototype.onmessage = function(event) {

    let msg = pbkiller.newHead(event.data);

    //保存服务器时间
    this.emit(Socket.Event.ON_SOCKET_MESSAGE, msg);
    //清理缓存
    let task;
    if (msg.sequence) {
        task = this.taskQueue[msg.sequence];
        delete this.taskQueue[msg.sequence];
    }

    //数据为空, 且不为心跳包退出
    if (!msg.data && msg.code !== ClientAction.ACTION_HEARTBEAT && !msg.push) {
        cc.log("response data is null..............");
        return;
    }

    //如果有错，退出
    if (this.handleError(msg, task)) {
        return;
    }

    //处理推送消息
    this.handlePush(msg.push);
    //这里处理回应
    try {
        if(task && task.cb){
            let rsp = pbkiller.newRsp(msg.code, msg.data);
            task.cb.call(task.target, rsp);
        }
    } catch (e) {
        this.handleError(msg, task, e);    
    }

    if (task) {
        this.emit(Socket.Event.ON_END_REQUEST, msg.code);
    }

};

/**
 * 关闭websocket
 */
Socket.prototype.close = function() {
    try {
        this.ws.close();
    } catch (e) {
    }
};

/**
 * websocket关闭事件
 * @param event
 */
Socket.prototype.onclose = function(event) {
    this.status = 'closed';
    this.emit(Socket.Event.ON_SOCKET_CLOSED);
};

/**
 * websocket错误事件
 * @param event
 */
Socket.prototype.onerror = function(event) {
    this.status = 'error';
    this.emit(Socket.Event.ON_SOCKET_ERROR, event);
};

/**
 * 请求函数
 * @param sequence  请求序列
 * @param data      发送数据
 * @param cb        响应处理函数
 * @param error     错误处理函数
 * @param target    回调函数绑定对象
 */
Socket.prototype.requestImpl = function(sequence, data, cb, error, target) {
    let requestData = {
        sequence: sequence,
        data: data,
        target: target,
        cb: cb,
        error: error
    };

    switch (this.status) {
        case 'connecting':
        case 'error':
            this.waitQueue.push(requestData);
            break;
        case 'connected':
            this.taskQueue[sequence] = requestData;
            this.ws.send(requestData.data);
            break;
        case 'closed':
            break;
    }
};

/**
 * 发送，无响应
 */
Socket.prototype.send = function(protoBuff) {
    let message = pbkiller.newHead();
    message.setCode(protoBuff.$code);
    message.setData(protoBuff.toArrayBuffer());
    this.ws.send(message.toArrayBuffer());   
};

/**
 * 请求函数
 * @param code          操作码
 * @param protoBuff     ptotobuff对象
 * @param cb            响应处理函数
 * @param error         错误处理函数
 * @param target        回调函数绑定对象
 */
Socket.prototype.request = function(protoBuff, cb, error, target) {

    ++this.sequence;
    this.emit(Socket.Event.ON_PRE_REQUEST, protoBuff.$code);

    let message = pbkiller.newHead();
    message.setSequence(this.sequence);
    if(this.token){
        message.setToken(this.token);
    }

    cc.log('request action code: %s', protoBuff.$code);
    message.setCode(protoBuff.$code);
    message.setData(protoBuff.toArrayBuffer());

    this.requestImpl(this.sequence, message.toArrayBuffer(), cb, error, target);
};


/**
 * 推送处理
 * @param messages  推送消息数据组
 */
Socket.prototype.handlePush = function(messages) {
    if (!messages || !messages.length) {
        return;
    }

    messages.forEach(function(message) {
        cc.log('handlePush pushCode: %s',message.pushCode);

        let rsp = pbkiller.newPush(message.pushCode, message.data);
        this.emit(Socket.Event.ON_PUSH_MESSAGE,message.pushCode,rsp);
        this.emit(Socket.Event.ON_PUSH_MESSAGE_END,message.pushCode,rsp);
    }, this);
};

Socket.PUSH_MSG = 'PUSH_MSG_';

module.exports = Socket;