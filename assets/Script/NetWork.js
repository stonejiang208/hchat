
var pb = require ("protobufjs");

var WebSocket = WebSocket || window.WebSocket || window.MozWebSocket;
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
            var self = this;      
            var reader = new FileReader();
            reader.readAsArrayBuffer(evt.data);

            reader.onload = function (e) {
                var buf = new Uint8Array(reader.result);
                var root = self.pbRoot;
                var t1 = root.lookupType("GP.Msg");
                var m1 = t1.decode (buf);
    
                cc.log('Network onmessage:' + m1);
                self.unpacketLayer1(m1);
            }
           
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
        var code = (mask << 28) | (appCode << 16) | cmdCode;
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
    // unpacket layer 1
    unpacketLayer1:function(data){
        var self = this;
        var code = data.code;
        var p0 = data.payload;
        var mask = code >> 28;
        var appCode =  (0xFFF << 16 & code) >> 16;
        var cmd = code & 0x0000FFFF;
        cc.log (code,mask,appCode,cmd);
   
        if (mask == 1)
        {        
            var root = self.pbRoot;
            var t1 = root.lookupType("GP.Msg_Rsp");
            var m1 = t1.decode (p0);
            cc.log('unpacketLayer1 onmessage:' + m1);
            cc.log ("rsp result:", m1.result);
            var rsp = {};
            rsp.cmd = cmd;
            rsp.result = m1.result;
            rsp.appCode = appCode;
            if (m1.result == 0)
            {
                var t2 = root.lookupType("GP.Account.Create_Account.Rsp");       
                var m2 = t2.decode (m1.payload);
                cc.log('unpacketLayer1 onmessage:' ,m2.uid);
                rsp.payload = m2;
            }
            else
            {
                cc.log ("error");
            }
            NetTarget.emit("rsp", rsp);
        }
        else if (mask == 2)
        {
            
        }
           
    },

});

window.Network = instance ? instance : new Network();