/**
 * Created by jiangtao on 24/12/2017.
 */

cc.Class({
    extends: cc.Component,

    properties: {
        scrollViewConent:cc.Node,
        chatEditBox:cc.EditBox,
        chatItemPre:cc.Prefab
    },

    onLoad:function() {
        this._chatPool = new cc.NodePool();
        this._chatMsgIndex = 0;
    },

    backHallClick:function () {
        cc.director.loadScene('gameHall');
    },

    sendChatClick:function(eve){
        var str = this.chatEditBox.string;
        cc.log('聊天内容:'+str);

        this.createChatMsg(str);
    },
    createChatMsg:function (str) {
        var chatItem = this._chatPool.get();
        this._chatMsgIndex ++ ;
        if (this._chatPool.size() <= 0) {
            chatItem = cc.instantiate(this.chatItemPre);
            var userInfo = {userId:123,userName:"最多6个字",userLevel:1};
            var height = chatItem.getContentSize().height;
            chatItem.getComponent('chatItem').setPlayerInfo(userInfo);
            chatItem.getComponent('chatItem').setChatMsg(str);
            chatItem.x = -300;
            chatItem.y = -459 + this._chatMsgIndex * height;
        }
        this.scrollViewConent.addChild(chatItem);
        var height = chatItem.getContentSize().height;
        this.scrollViewConent.height = this.scrollViewConent.children.length * height;
        //检测信息是否超过定义条数量
        let max = 15;
        let length = this.scrollViewConent.children.length;
        if (length > max) {
            let m = length - max;
            for (let i = 0; i < m; i++) {
                this._chatPool.put(this.scrollViewConent.children[i]);
            }
        }
    }
});
