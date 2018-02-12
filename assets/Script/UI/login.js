
cc.Class({
    extends: require('NetComponent'),

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad:function() {
        cc.log ("Loading: onLoad()");
        cc.director.preloadScene("ServerList", function () {
            cc.log("Next scene preloaded");
        });
       // openView('Loading');
    },

    onEnable() {
        this._super();
        //NetTarget.on('chat', this.on_msg.bind(this));
        NetDataGloble.on('netstart',this, this.netStart);
        NetDataGloble.on('account.rsp',this, this.getAccountRspData);
      
    },
    onDisable() {
          
        // NetTarget.off('chat', this.on_msg.bind(this));
       // NetDataGloble.off('netstart', this.netStart);
       //NetDataGloble.off('account.rsp', this.getAccountRspData); 
       //不能在这里移除观察者，因为如果是本地没有数据会切换到注册场景移除观察者没有办法登录了在切换到大厅
       //之前移除本文件的观察者
       cc.log ("remove 111111111111111111111111111111111111111");
       this._super(); 
    },

    start:function () {
        cc.log ("Loading: start()");
        GameData.init();
        Network.initNetwork();//连接服务器
    },

    login:function () {
        //cc.director.loadScene("gameHall");
        var userInfo = cc.sys.localStorage.getItem('userInfo');
        if (userInfo) {
            cc.director.loadScene("gameHall");
        }else {
            cc.director.loadScene("registPlayer");
        }
    },
    netStart:function(event) {
        this._super(event);
        // closeView('Loading');
        var tmp = cc.sys.localStorage.getItem('userInfo');
        var userInfo = JSON.parse(tmp);
        if (userInfo) {
            cc.log (JSON.stringify(userInfo));

            var p = {};
            p["openid"] = userInfo.openid;
            p["openid_type"]=userInfo.openid_type;
            p["auto_create"]=1;
            var cmd = 2;
            var appCode = 0xFF0; // account  is 0xff0

            Network.sendReq(appCode,cmd,p);
            //cc.director.loadScene("gameHall");
        }else {
            cc.director.loadScene("registPlayer");
        }

    },

    getAccountRspData:function(event) {
        this._super(event);   
        var msg = event;
        cc.log ("account rsp:", JSON.stringify(msg));
        GameData.playerInfo = msg.body;
        var code = msg.code;
        var result = msg.result;
        var cmd = code & 0x0000FFFF;
        if (result != 0)
        {
            // error
            cc.log ("rsp error:", cmd,result);
            cc.sys.localStorage.removeItem('userInfo');
            return;
        }
     
        if (cmd == 1)
        {
            var userInfoJS = JSON.stringify(msg.body);

            cc.sys.localStorage.setItem('userInfo',userInfoJS);
            cc.log ("create account ok");

            var userInfo = JSON.parse(cc.sys.localStorage.getItem('userInfo'));
            cc.log (JSON.stringify(userInfo));
            cc.director.loadScene("Lobby");
        }
        else if (cmd == 2)
        {
            var userInfoJS = JSON.stringify(msg.body);
            cc.sys.localStorage.setItem('userInfo',userInfoJS);
            cc.log ("create account ok");
            NetDataGloble.off('netstart', this.netStart);
            NetDataGloble.off('account.rsp', this.getAccountRspData);
            cc.director.loadScene("Lobby");
        }

    },
    /**
     * 获取服务端响应
     */
    getRspData: function (event) {
        cc.log("append");
    },
    // update (dt) {},
});
