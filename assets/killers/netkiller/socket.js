/**
 * Created by zxh on 15/11/10.
 */

let Emitter = require('../../libs/emitter.js');

/**
 * Socket通信类,封装websocket与Proto
 * @param host
 * @constructor
 */
let Socket = function(host) {
    let ws = new WebSocket(host);
    ws.binaryType = "arraybuffer";

    //绑定事件
    ws.onopen = this.onopen.bind(this);
    ws.onmessage = this.onmessage.bind(this);
    ws.onclose = this.onclose.bind(this);
    ws.onerror = this.onerror.bind(this);

    this.ws = ws;
    this.status = 'connecting';
    this.taskQueue = {};
    this.waitQueue = [];
    this.playerId = null;
    this.sequence = 0;
    this.serverTime = 0;
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

/**
 * websocket有消息到达事件
 * @param event
 */
Socket.prototype.onmessage = function(event) {

    let msg = PB.core.PBMessage.decode(event.data);
    //保存服务器时间
    this.emit(Socket.Event.ON_SOCKET_MESSAGE, msg);

    //清理缓存
    let task;
    if (msg.sequence) {
        task = this.taskQueue[msg.sequence];
        delete this.taskQueue[msg.sequence];
    }

    //数据为空, 且不为心跳包退出
    if (!msg.data && msg.code !== ClientAction.ACTION_HEARTBEAT && !msg.pushMsg) {
        cc.log("response data is null..............");
        return;
    }

    //处理错误码
    if (msg.errorCode > 0) {
        let errMsg = PB.core.ErrorMsg.decode(msg.data);
        cc.error("错误码:%d, 错误信息:%s", errMsg.code, errMsg.msg);
        this.emit(Socket.Event.ON_MESSAGE_ERROR, errMsg);
        if (task && task.error) {
            task.error.call(task.target, errMsg);
        }
        return;
    }

    //处理推送消息
    this.handlePush(msg.pushMsg);
    //这里处理回应
    try {

        if(task && task.cb){
            let rsp = pbHelper.decodeRsp(msg.code, msg.data);
            task.cb.call(task.target, rsp);
        }
    } catch (e) {
        cc.log(e.stack);
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

    let message = new PB.core.PBMessage();
    message.setSequence(this.sequence);
    if(this.playerId){
        message.setPlayerId(this.playerId);
    }

    cc.log('request action code: %s', protoBuff.$code);
    message.setCode(protoBuff.$code);
    delete protoBuff.$code;
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
        cc.log('handlePush pushType: %s',message.pushType);

        let rsp = pbHelper.decodePushMsg(message.pushType, message.data);
        this.emit(Socket.Event.ON_PUSH_MESSAGE,message.pushType,rsp);
        this.emit(Socket.Event.ON_PUSH_MESSAGE_END,message.pushType,rsp);
    }, this);
};

Socket.PUSH_MSG = 'PUSH_MES_';

module.exports = Socket;