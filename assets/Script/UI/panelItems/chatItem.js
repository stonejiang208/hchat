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
        playerItem :cc.Prefab,
        chatMsgContent :cc.RichText
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //this.playerNode = cc.find('head',this.node);
        //this.playerNode.addChild(cc.instantiate(this.playerItem));
    },

    setChatMsg:function (msg) {
        this.chatMsgContent.string =  msg;
    },

    setPlayerInfo:function (playerData) {
        this.playerNode = cc.find('head',this.node);
        var playerItem = cc.instantiate(this.playerItem);
        playerItem.getComponent('playerItem').setPlayerInfo(playerData);
        this.playerNode.addChild(playerItem);

    },

    start () {

    },

    // update (dt) {},
});
