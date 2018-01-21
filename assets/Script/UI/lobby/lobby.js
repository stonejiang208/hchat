

cc.Class({
    extends: require('NetComponent'),

    properties: {
        nameLB: cc.Label,   //用户名
    },


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        var userInfo = JSON.parse(cc.sys.localStorage.getItem('userInfo'));
        this.nameLB.string = "玩家名称: "+ userInfo.name;
    },

    // update (dt) {},
});
