
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
        openView('Loading');
    },

    start:function () {
        cc.log ("Loading: start()");

        Network.initNetwork();//连接服务器
    },
    login:function () {
        //cc.director.loadScene("gameHall");
        var userInfo = cc.sys.localStorage.getItem('userInfo');
        if (userInfo) {
            cc.director.loadScene("gameHall");
        }else {
            cc.director.loadScene("regist");
        }
    },
    netStart:function(event) {
        this._super(event);
        closeView('Loading');
        GameData.init();
        cc.log ("Loading: net start()");
        var p = {};
        p.name = '122';
        p.head_url = "http://header1.xxx.xxx";
        p.password = "mypassword";
        p.sex_type= 1;
        var cmd = 1;
        var appCode = 0xFF0;

        Network.sendReq(appCode,cmd,p);

    },

    getAccountRspData:function(event) {
        this._super(event);   
        var msg = event.detail;
        cc.log ("account rsp:", JSON.stringify(msg));
        var code = msg.code;
        var result = msg.result;
        if (result != 0)
        {
            // error
            return;
        }
        var cmd = code & 0x0000FFFF;
        if (cmd == 1)
        {
            var userInfoJS = JSON.stringify(msg.body);

            cc.sys.localStorage.setItem('userInfo',userInfoJS);
            cc.log ("create account ok");

            var userInfo = JSON.parse(cc.sys.localStorage.getItem('userInfo'));

            cc.log (JSON.stringify(userInfo));
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