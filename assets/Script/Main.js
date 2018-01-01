// file: main.js
cc.Class({
    extends: require('NetComponent'),

    properties: {
        mainLayer: cc.Node,
        chatLayer: cc.Node,
        editBox: cc.EditBox,

        userCountLb: cc.Label,   //在线人数
        chatBox: cc.EditBox,
        lbPrefab: cc.Prefab,  //广播文字
        wordPrefab: cc.Prefab,//聊天文字
        chatScroll: cc.ScrollView,
        content: cc.Node,
        broadcastLayer: cc.Node,     //显示广播
        successLb: cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        this.mainLayer.active = true;
        this.chatLayer.active = false;

        //创建对象池
        this.lbPool = this.createPool(this.lbPrefab);
        this.wordPool = this.createPool(this.wordPrefab);
        Network.loadProtoFiles();
    },
    //加入房间
    login:function() {
        if (this.editBox.string == '') {
            alert('请输入昵称');
            return;
        }
        this.mName = this.editBox.string;
        Network.initNetwork();//连接服务器
    },

    // 申请操作的令牌
    applyToken:function()
    {
     cc.log ("applyToken");
     var root = Network.pbRoot;
     var p = {};
     var code = root.GP.Lobby.Msg_Code.APPLY_TOKEN;
     var type = "GP.Lobby.Apply_Token";
     var appCode = root.GP.Msg_Type.MT_LOBBY;

     Network.sendReq(appCode,type,p);
    },

    //获取房间列表
    createRoom:function()
    {
      cc.log ("create room");
      var root = Network.pbRoot;
      var p = {};
      p.appCode = 321;
      p.token = 123;
      var code = root.GP.Lobby.Msg_Code.CREATE_ROOM;
      var type = "GP.Lobby.Create_Room";
      var appCode = root.GP.Msg_Type.MT_LOBBY;

      Network.sendReq(appCode,type,p);
    },
    //获取房间列表
    getRoomList:function()
    {
        var k = "GP.Lobby.Apply_Token";
        var cmd = Network.getMsgCmd(k);
        cc.log (k,"=====>", cmd);
    },
    //发送消息
    send:function() {
        if (this.chatBox.string == '') {
            alert('消息不能为空');
            return;
        }

        var root = Network.pbRoot;
        var p = {};
        p.msg = this.chatBox.string;
        var code = root.GP.Account.Msg_Code.CREATE_ACCOUNT;
        var type = "GP.Chat.Text_Msg";
        var appCode = 0x123;

        Network.sendReq(appCode,type,p);

       // Network.send({ f: 'send', msg: this.chatBox.string });
    },

    //退出房间
    close:function() {
        Network.close();
        this.mainLayer.active = true;
        this.chatLayer.active = false;
    },

    //连接成功
    netStart:function(event) {
        this._super(event);
        //发送登录
        var root = Network.pbRoot;
        var p = {};
        p.name = this.mName;
        p.headUrl = "http://header1.xxx.xxx";
        p.password = "mypassword";
        p.sexType = 1;
        var code = root.GP.Account.Msg_Code.CREATE_ACCOUNT;
        var type = "GP.Account.Create_Account";
        var appCode = root.GP.Msg_Type.MT_ACCOUNT;

        Network.sendReq(appCode,type,p);

       // Network.send({ f: 'login', msg: this.mName });
    },

    getNetData:function(event) {
    },
    getRspData:function(event) {
        cc.log ("on getRspData");
        var root = Network.pbRoot;
        var rsp = event.detail;
        cc.log (JSON.stringify(rsp));
        /*
        {"cmd":1,"result":0,"payload":{"uid":"9"}}
        */
        if (rsp.result != 0)
        {
            // some thing wrong
            return;
        }
        switch (rsp.appCode)
        {
            case root.GP.Msg_Type.MT_ACCOUNT: // Account
            {
                switch (rsp.cmd)
                {
                  case root.GP.Account.Msg_Code.CREATE_ACCOUNT:
                  this.onLogin(rsp.payload);
                  break;
                }
            }
            break;

            case root.GP.Msg_Type.MT_LOBBY: // Account
            {
                switch (rsp.cmd)
                {
                  case root.GP.Lobby.Msg_Code.APPLY_TOKEN:
                  this.onRspReplyToken(rsp.payload);
                  break;
                }
            }
            break;
        }
// swith
        /*
        var code = data.code;
        var mask = code >> 28;
        var appCode =  (0xFFF << 16 & code) >> 16;
        var cmd = code & 0x0000FFFF;
        cc.log (code,mask,appCode,cmd);
        
        if (data.f) {
            let msg = data.msg || {};
            switch (data.f) {
                case 'login':
                    this.onLogin(msg);
                    break;
                case 'join':
                    this.onJoin(msg);
                    break;
                case 'sendSuccess':
                    this.onSendSuccess(msg);
                    break;
                case 'send':
                    this.onSend(msg);
                    break;
                case 'quit':
                    this.onQuit(msg);
                    break;
            }
        }*/
    },

    //登录成功，进入房间
    onLogin:function(payload) {
        this.userName = payload.name;
        this.clientId = payload.uid;

        this.mainLayer.active = false;
        this.chatLayer.active = true;

        this.successLb.node.opacity = 0;
    },

    onRspReplyToken:function(payload) {
        cc.log (JSON.stringify(payload));
    },


    //有人加入房间
    onJoin:function(msg) {
        let name = msg.userName;
        let userNum = msg.userNum;

        //刷新人数
        this.userCountLb.string = '在线人数：' + userNum;

        this.showBroadcast(name + '加入房间');
    },

    //发送成功
    onSendSuccess:function(msg) {
        this.successLb.node.opacity = 255;
        this.successLb.string = msg;

        this.successLb.node.runAction(cc.fadeOut(1));
        this.chatBox.string = '';
    },

    //接收消息
    onSend:function(msg) {
        let name = msg.userName, time = msg.time, info = msg.info;
        this.showChatWord(name, time, info);
    },

    //有人退出房间
    onQuit:function(msg) {
        let name = msg.userName;
        let userNum = msg.userNum;
        //刷新人数
        this.userCountLb.string = '在线人数：' + userNum;

        this.showBroadcast(name + '退出房间');
    },

    //显示广播
    showBroadcast:function(str) {
        let b = this.createByPool(this.lbPool, this.lbPrefab);
        b.x = 0;
        b.opacity = 255;
        b.getComponent(cc.Label).string = str;
        this.broadcastLayer.addChild(b);
        b.runAction(cc.sequence(cc.delayTime(2), cc.fadeOut(1), cc.callFunc(data => {
            this.lbPool.put(data);
        })));
    },

    //刷新聊天
    showChatWord:function(name, time, info) {
        let w = this.createByPool(this.wordPool, this.wordPrefab);
        w.x = 0;
        let namelb = w.getChildByName('name').getComponent(cc.Label);
        let timelb = namelb.node.getChildByName('time').getComponent(cc.Label);
        let infoLb = w.getChildByName('lb').getComponent(cc.Label);
        namelb.string = name;
        timelb.string = time;
        infoLb.string = info;
        this.content.addChild(w);
        timelb.node.x = namelb.node.width + 20;

        //检测信息是否超过50条
        let max = 50;
        let length = this.content.children.length
        if (length > max) {
            let m = length - max;
            for (let i = 0; i < m; i++) {
                this.wordPool.put(this.content.children[i]);
            }
        }

        //延迟刷新pageView
        this.node.runAction(cc.sequence(cc.delayTime(0.05), cc.callFunc(() => {
            if (this.content.height> this.content.parent.height) {
                cc.log('sss');
                this.chatScroll.scrollToBottom(0.1);
            }
        })))

    },


    createPool:function(prefab) {
        let pool = new cc.NodePool();
        for (let i = 0; i < 10; i++) {
            let p = cc.instantiate(prefab);
            pool.put(p);
        }
        return pool;
    },

    createByPool:function(pool, prefab) {
        let p;
        if (pool.size() > 0) {
            p = pool.get();
        } else {
            p = cc.instantiate(prefab);
        }
        return p;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
