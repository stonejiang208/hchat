
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad:function() {
        cc.log ("Loading: onLoad()");
        cc.director.preloadScene("ServerList", function () {
            cc.log("Next scene preloaded");
        });
    },

    start:function () {
        cc.log ("Loading: start()");
        //cc.director.loadScene("ServerList");
    },
    login:function () {
        cc.director.loadScene("gameHall");
    }

    // update (dt) {},
});
