// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

cc.Class({
    extends: cc.Component,

    properties: {
        userId:0,
        userName:cc.Label,
        userLevel:cc.Label,
        userVip:cc.Label,
        headIcon:cc.Sprite,
        headBg:cc.Sprite
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },

    setPlayerInfo : function (userInfo) {
        this.userId = userInfo.userId;
        this.userName.string = userInfo.userName;
        this.userLevel.string = 'Lv.'+userInfo.userLevel;
    }

    // update (dt) {},
});
