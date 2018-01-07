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
        pageContent:cc.Node,
        chatItem :cc.Prefab
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.initUI();
        this.regislister();
        this.refreshUI();
    },

    start () {

    },

    initUI:function () {
        this.initMsgList();
        this.initFriendList();
        this.initChatList();
    },

    regislister:function () {
        cc.game.on('onChatMsg',this.refreshChatList);
    },

    initMsgList:function () {
        var msgNode = cc.find('msgNode',this.pageContent);

    },

    initFriendList:function () {
        var friendNode = cc.find('friendNode',this.pageContent);
    },

    initChatList:function () {
        var chatNode = cc.find('chatNode',this.pageContent);
        var chatScollViewContent = cc.find('content',chatNode);
    },

    /**
     * 刷新ui
     */
    refreshUI:function (data) {

    },

    /**
     * 选择底部页签
     */
    selecteHallPage:function (eve,data) {
        cc.log('pageViewIndex:'+data);
        for (var i = 0;i<this.pageContent.childrenCount;i++) {
            if (data == i) {
                this.pageContent.children[i].active = true;
            }else {
                this.pageContent.children[i].active = false;
            }
        }

    },

    refreshChatList:function () {

    }




    // update (dt) {},
});
