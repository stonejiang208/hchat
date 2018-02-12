
var pb = {}

var WebSocket = WebSocket || window.WebSocket || window.MozWebSocket;
window.NetTarget = null;
//var NetDataGloble =require('NetData');
//window.NetDataGloble = null;  //字符串以及其他正常发送 数字变量命名规则有符号整形n_XX  无符号u_xx 浮点数d_XX
var login = require('login');
let instance = null;

let Network = cc.Class({
    //extends: require('NetData'),
    properties: {
        data: 1000,
        isInit: false,
    },

    ctor() {
        
        //NetDataGloble = new NetDataGloble();
        NetTarget = new cc.EventTarget();
    },
    initNetwork() {
        if (this.isInit) {
            cc.log('Network is already inited...');
            return;
        }
        cc.log('Network initSocket...');
        var host = config.severIp;
        this.socket = new WebSocket(host);
        this.socket.onopen = (evt) => {
            cc.log('Network onopen...');
            this.isInit = true;
            NetDataGloble.emit("netstart");
        }

        this.socket.onmessage = (evt) => {
            var self = this;
            //cc.log (evt);
            var msg = JSON.parse (evt.data);
            var code = msg.header.code;
            var mask = code >> 28;
            var appCode = (0x0FFFFFFF&code)>>16;
            var cmd = code & 0x0000FFFF;
           
            if (appCode == 0xFF0)  // Account
            {
                if (mask == 1)
                {
                    //create account
                    var rsp = {};
                    rsp.code = code;
                    rsp.result = msg.header.result;
                    rsp.body = msg.body;
                    //NetTarget.emit("account.rsp",rsp);
                    NetDataGloble.emit('account.rsp', rsp);
                }
               
            }
            else if (appCode == 0xFF1) // Lobby
            {
                if (mask == 1)
                {
                    var cmd = code & 0x0000FFFF;
                    if (cmd == 7)
                    {
                        Network.callBack(code,msg.body)
                    }
                    else
                    {
                        var rsp = {};
                        rsp.code = code;
                        rsp.result = msg.header.result;
                        rsp.body = msg.body;
                        //NetTarget.emit("lobby.rsp",rsp);
                        NetDataGloble.emit('lobby.rsp', rsp);
                    }
                    
                }
            }
            else if (appCode < 0xFF0)
            {
                NetDataGloble.emit("chat",msg);
            }

        }

        this.socket.onerror = (evt) => {
            cc.log('Network on error...');
        };

        this.socket.onclose = (evt) => {
            cc.log('Network onclose...');
            NetTarget.emit("netclose");
            this.isInit = false;
        }
    },
    // 发送请求到服务端
    sendReq:function(appCode,cmd,body,callback){
        var self = this;
        var msg = {}
        var header ={}
        header["code"] = appCode<<16|cmd;
        msg["body"] = body;
        msg["header"] = header;
        var str = JSON.stringify(msg);
        cc.log ("send msg :", str);
        self.sendRaw(str);
        if(callback){
            Network.callBack = callback;
        }
        },
     // 发送请求到服务端
     sendNTF:function(appCode,cmd,body){
        var self = this;
        var msg = {}
        var header ={}
        header["code"] = 3<<28 | appCode<<16|cmd;
        msg["body"] = body;
        msg["header"] = header;
        var str = JSON.stringify(msg);
        cc.log ("send ntf msg :", str);
        self.sendRaw(str);
        },
    // send pf
    sendRaw:function(msg) {
        if (!this.isInit) alert('Network is not inited...');
        else if (this.socket.readyState == WebSocket.OPEN) {
            this.socket.send(msg);
        } else cc.log('Network WebSocket readState:' + this.socket.readyState);
    },
    //发送消息给服务器
    send(data) {
        if (!this.isInit) alert('Network is not inited...');
        else if (this.socket.readyState == WebSocket.OPEN) {
            let tdata = JSON.stringify(data);
            cc.log('Network send:' + tdata);
            this.socket.send(tdata);
        } else cc.log('Network WebSocket readState:' + this.socket.readyState);
    },

    //请求token
    requestToken(callBack){
        var b = {};
        var cmd = 7;  // create room
        var appCode = 0xFF1; // lobby  is 0xff0
        this.sendReq(appCode,cmd,b,callBack);
    },

    //断开连接
    close() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    },
    /**
     * 模拟服务端数据
     */
    testServerData(data) {
        this.appandeMsg(data);
    },
    handleReq:function(appCode,cmd,p0){
        cc.log ("handleReq");

    },
    handleRsp:function(appCode,cmd,p0){
        cc.log ("handleRsp");
    }

});

window.Network = instance ? instance : new Network();
