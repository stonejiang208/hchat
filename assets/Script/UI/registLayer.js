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
        headIcon:cc.Sprite,
        PlayerName:cc.EditBox
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.headIcon.on(cc.Node.EventType.TOUCH_START,this.randomHeadIcon,this);
    },

    randomHeadIcon:function () {
        var url = 'resources/UI/icon/circle_'+ this.randomNum(1,5);
        var texture = cc.textureCache.addImage(cc.url.raw(url));
        this.headIcon.spriteFrame = new cc.SpriteFrame(texture);
    },

    registClick:function (eve) {
        //send regist seq
        var name = this.PlayerName.string;
    },
    randomNum:function (min,max) {
        return Math.floor(Math.random()*(max-min)) + min;
    }

    // update (dt) {},
});
