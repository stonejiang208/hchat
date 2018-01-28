
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
            p.name = userInfo.name;
            p.uid = userInfo.uid;
            p.head_url = "default";
            p.password = "";
            p.sex_type= 1;
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
        var msg = event.detail;
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
