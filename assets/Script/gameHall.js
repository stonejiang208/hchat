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
        layers:{
            default: [],
            type:cc.Node
        },
        pageContent:cc.Node,

        msgContent:cc.Node,  //msg about
        friendContent:cc.Node,  //firend about
        chatContent:cc.Node,  //chat about
        chatRoomItem :cc.Prefab //chatRoomItem
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad :function() {
        this.initUI();
        this.registerlister();
        this.refreshUI();
    },

    start :function() {

    },

    onDestry:function () {

    },
    initUI:function () {
        this.initMsgList();
        this.initFriendList();
        this.initChatList();
    },

    registerlister:function () {
        cc.game.on('onChatMsg',this.refreshChatList);
    },

    initMsgList:function () {
    },

    initFriendList:function () {
    },

    initChatList:function () {

        var chatRoomData = [
            {roomid:1},
            {roomid:2},
            {roomid:3}
        ]
        //init chat 1 同城
        var chatScollViewContent1 = cc.find('chat1/chatScollView1/view/content',this.chatContent);
            for (var i = 0; i<chatRoomData.length; i++) {
                var chatRoomNode = cc.instantiate(this.chatRoomItem);
                chatRoomNode.getComponent('chatRoomItem').setRoomid(chatRoomData[i].roomid);
                chatRoomNode.name = 'chatRoom' + i;
                chatRoomNode.on(cc.Node.EventType.TOUCH_END,this.enterChatRoom,this);
                var width = chatRoomNode.getContentSize().width;
                var height = chatRoomNode.getContentSize().height;
                chatRoomNode.x = -360 + (i%2 == 0 ? 0 : width);
                chatRoomNode.y = -95 - (Math.floor(i/2)== 0 ? 0 : height*i/2);
                chatScollViewContent1.addChild(chatRoomNode);
            }
        //init chat 2 家族
        var chatScollViewContent2 = cc.find('chat2/chatScollView2/view/content',this.chatContent);

        //init chat 3 娱乐
        var chatScollViewContent3 = cc.find('chat3/chatScollView3/view/content',this.chatContent);
    },

    /**
     * 刷新ui
     */
    refreshUI:function () {
        this.selecteHallPage();
    },

    /**
     * 选择底部页签
     */
    selecteHallPage:function (eve,data) {
        cc.log('pageViewIndex:'+data);
        data = data||0;
        for (var i = 0;i<this.layers.length;i++) {
            if (data == i) {
                this.layers[i].active = true;
            }else {
                this.layers[i].active = false;
            }
        }
    },

    refreshChatList:function () {

    },
    //进入指定聊天房间
    enterChatRoom: function (eve,data) {
        cc.log('roomid :'+eve.target.name);
        cc.director.loadScene('chatRoom');
    }




    // update (dt) {},
});
