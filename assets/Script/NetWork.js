
var pb = require ("protobufjs");

let WebSocket = WebSocket || window.WebSocket || window.MozWebSocket;
window.NetTarget = null;

let instance = null;

let Network = cc.Class({
    properties: {
        data: 1000,
        isInit: false,
    },

    ctor() {
        NetTarget = new cc.EventTarget();;
    },
    loadProtoFiles(){
      cc.log ("load ProtoFiles");
      var self = this;
      self.pbRoot = {};
      var fullPath = cc.url.raw("resources/pb/GP_All.proto");
      cc.log ("full path is", fullPath);
      pb.load (fullPath,function(err,root){
          if (err)
          {
              cc.log (err);
              throw err;
          }
          else
          {
              cc.log ("protobuf files load completed.");
              self.pbRoot = root;
              cc.log (root);
          }
      });
    },
    initNetwork() {
        if (this.isInit) {
            cc.log('Network is already inited...');
            return;
        }
       
        cc.log('Network initSocket...');
        let host = "ws://mbp.tao-studio.net:6001";
       // let host = "ws://47.104.15.140:3000"
        this.socket = new WebSocket(host);
        this.socket.onopen = (evt) => {
            cc.log('Network onopen...');
            this.isInit = true;
            NetTarget.emit("netstart");
        }

        this.socket.onmessage = (evt) => {
            let msg = evt.data;
            cc.log('Network onmessage:' + evt.data);
            let dataObj = JSON.parse(msg);
            this.appandeMsg(dataObj);
        }

        this.socket.onerror = (evt) => {
            cc.log('Network onerror...');
        };

        this.socket.onclose = (evt) => {
            cc.log('Network onclose...');
            NetTarget.emit("netclose");
            this.isInit = false;
        }
    },
    
    // 发送请求到服务端
    sendReq:function(appCode,cmdCode,msgType,payload){
        var self = this;
        var root = self.pbRoot;
        var mask = root.GP.Msg.Msg_Type.PT_REQ;
        var code = (mask << 24) | (appCode << 18) | cmdCode;
        cc.log ("cmd = " , code ,appCode, cmdCode,msgType);

        try
        {
            // 第1层 的消息  GP.xxx.Req
            var t1 = root.lookupType (msgType);
            var d1 = t1.create (payload);
            var b1 = t1.encode(d1).finish();

            // 第2层
            var t2= root.lookupType ("GP.Msg_Req");
            var p2 = {};
            p2.payload = b1;
            var d2 = t2.create (p2);
            var b2 = t2.encode(d2).finish();

            // 第3层
            var t3= root.lookupType ("GP.Msg");
            var p3 = {};
            p3.code = code;
            p3.payload = b2;
            var d3 = t3.create (p3);
            var b3 = t3.encode(d3).finish();
            self.sendRaw (b3);
        }
        catch (e) {
                cc.log(e);
            }
        },
    // send pf
    sendRaw(msg) {
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

    //断开连接
    close() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    },
    //接受数据
    appandeMsg(data) {
        NetTarget.emit("net", data);
    },
    /**
     * 模拟服务端数据
     */
    testServerData(data) {
        this.appandeMsg(data);
    },

});

window.Network = instance ? instance : new Network();