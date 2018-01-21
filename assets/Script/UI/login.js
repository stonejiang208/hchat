
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
    /**
     * 获取服务端响应
     */
    getRspData: function (event) {
        cc.log("append");
    },
    // update (dt) {},
});