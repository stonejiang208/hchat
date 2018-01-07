
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
        NetTarget = new cc.EventTarget();
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
              var map2 = new Map();
              var map = new Map();
              map.set("abc",123);
              //------
              map.set("GP.Account.Create_Account",
                      root.GP.Account.Msg_Code.CREATE_ACCOUNT);
              map.set("GP.Account.Guest_Sign_In",
                      root.GP.Account.Msg_Code.GUEST_SIGN_IN);
              map2.set(root.GP.Msg_Type.MT_ACCOUNT,map);

              //------
              map = new Map();

              map.set("GP.Lobby.Create_Room",root.GP.Lobby.Msg_Code.CREATE_ROOM);
              map.set("GP.Lobby.Enten_Room",root.GP.Lobby.Msg_Code.ENTER_ROOM);
              map.set("GP.Lobby.Get_Room_List",root.GP.Lobby.Msg_Code.GET_ROOM_LIST);
              map.set("GP.Lobby.Leave_Room",root.GP.Lobby.Msg_Code.LEAVE_ROOM);
              map.set("GP.Lobby.Apply_Token",root.GP.Lobby.Msg_Code.APPLY_TOKEN);
              map2.set(root.GP.Msg_Type.MT_LOBBY,map);
              //------
              self.msgMap = map2;
          }
      });
    },
    initNetwork() {
        if (this.isInit) {
            cc.log('Network is already inited...');
            return;
        }
        cc.log('Network initSocket...');
        var host = "ws://qa.tao-studio.net:6001";
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
    sendReq:function(appCode,msgType,payload){
        var self = this;
        var root = self.pbRoot;
        var cmdCode = self.getMsgCmd(appCode,msgType);
        var mask = root.GP.Msg.Msg_Type.PT_REQ;
        var code = (mask << 28) | (appCode << 16) | cmdCode;
        cc.log ("cmd = " , code ,appCode, cmdCode,msgType);
        try
        {
            // 第1层 的消息  GP.xxx.Req
            var tag = msgType + ".Req";
            var t1 = root.lookupType (tag);
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
    handleReq:function(appCode,cmd,p0){
        cc.log ("handleReq");

    },
    handleRsp:function(appCode,cmd,p0){
        cc.log ("handleRsp");
    },
    // unpacket layer 1
    unpacketLayer1:function(data){
        var self = this;
        var root = self.pbRoot;
        var code = data.code;
        var p0 = data.payload;
        var mask = code >> 28;
        var appCode =  (0xFFF << 16 & code) >> 16;
        var cmd = code & 0x0000FFFF;
        cc.log (code,mask,appCode,cmd);
        switch (mask)
        {
            case  root.GP.Msg.Msg_Type.PT_REQ:
            self.handleReq(appCode,cmd,p0);
            break;
            case  root.GP.Msg.Msg_Type.PT_RSP:
            self.handleRsp(appCode,cmd,p0);
            break;
            default:
            break;
        }

        if (mask == root.GP.Msg.Msg_Type.PT_RSP)
        {
            var t1 = root.lookupType("GP.Msg_Rsp");
            var m1 = t1.decode (p0);
            cc.log('unpacketLayer1 onmessage:' + m1);
            cc.log ("rsp result:", m1.result);
            var rsp = {};
            rsp.cmd = cmd;
            rsp.result = m1.result;
            rsp.appCode = appCode;
            var m2 = {};
            if (m1.result == 0)
            {
                if (appCode == root.GP.Msg_Type.MT_ACCOUNT){
                    if (cmd == root.GP.Account.Msg_Code.CREATE_ACCOUNT)
                    {
                        var t2 = root.lookupType("GP.Account.Create_Account.Rsp");
                         m2 = t2.decode (m1.payload);
                        cc.log('unpacketLayer1 onmessage:' ,m2.uid);  
                    }
                }
                else if (appCode == root.GP.Msg_Type.MT_LOBBY)
                {
                    var msg_type = "";
                    switch (cmd)
                    {
                        case root.GP.Lobby.Msg_Code.CREATE_ROOM:
                        msg_type = "GP.Lobby.Create_Room.Rsp";
                        break;
                        case root.GP.Lobby.Msg_Code.APPLY_TOKEN:
                        msg_type = "GP.Lobby.Apply_Token.Rsp";
                        break;
                        case root.GP.Lobby.Msg_Code.GET_ROOM_LIST:
                        msg_type = "GP.Lobby.Get_Room_List.Rsp";
                        break;
                        case root.GP.Lobby.Msg_Code.ENTER_ROOM:
                        msg_type = "GP.Lobby.Enter_Room.Rsp";
                        break;
                        case root.GP.Lobby.Msg_Code.LEAVE_ROOM:
                        msg_type = "GP.Lobby.Leave_Room.Rsp";
                        break;
                    }
                    if (msg_type != "")
                    {
                        var t2 = root.lookupType (msg_type);
                        m2 = t2.decode(m1.payload);
                    }  
                }
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

    getMsgCmd:function (codeApp,tag){
        var map = this.msgMap;
        var map2 = this.msgMap.get(codeApp);

        map2.forEach(function(value, key, map) {
            console.log("Key: %s, Value: %s", key, value);
        });

        var cmd = map2.get(tag);
        cc.log (tag + "-->", cmd);
        return cmd;
    },
    getMsgTag:function(codeApp,cmd){
        var map = this.msgMap;
        var map2 = this.msgMap.get(codeApp);
    }

});

window.Network = instance ? instance : new Network();
