/**
 * Created by jiangtao on 24/12/2017.
 */

cc.Class({
    extends: require('NetComponent'),

    properties: {
        scrollViewConent:cc.Node,
        chatEditBox:cc.EditBox,
        chatItemPre:cc.Prefab,
        chatScrollView:cc.ScrollView,
        roomIdLB: cc.Label,   //房间号
    },
    onEnable() {
        this._super();   
        NetTarget.on('chat', this.on_msg.bind(this));
    },
    onDisable() {
        this._super();   
        NetTarget.off('chat', this.on_msg.bind(this));
    },
    onLoad:function() {
        this._chatPool = new cc.NodePool();
        this._chatMsgIndex = 0;
        var room_id = JSON.parse(cc.sys.localStorage.getItem('room_id'));
        this.roomIdLB.string = "房间编号: "+ room_id;
    },

    backHallClick:function () {
        cc.director.loadScene('gameHall');
    },

    sendChatClick:function(eve){
        var str = this.chatEditBox.string;
        cc.log('聊天内容:'+str);

        var b = {};
        b.msg = str;
        var cmd = 1;  // get room list
        var appCode = 321; // account  is 0xff0
        Network.sendReq(appCode,cmd,b);
       

       // this.createChatMsg(str);
    },
    createChatMsg:function (uid,str) {
        var chatItem = this._chatPool.get();
        this._chatMsgIndex ++ ;
        if (this._chatPool.size() <= 0) {
            chatItem = cc.instantiate(this.chatItemPre);
            var userInfo= {userId:uid,userName:"最多6个字",userLevel:this._chatMsgIndex};
            var height = chatItem.getContentSize().height;
            chatItem.getComponent('chatItem').setPlayerInfo(userInfo);
            chatItem.getComponent('chatItem').setChatMsg(str);
            chatItem.x = -300;
            chatItem.y =  height/2 - this._chatMsgIndex * height;
        }
        this.scrollViewConent.addChild(chatItem);
        var height = chatItem.getContentSize().height;
        this.scrollViewConent.height = this.scrollViewConent.children.length * height;
        if (this.scrollViewConent.height > this.scrollViewConent.parent.height) {
            this.chatScrollView.scrollToBottom(0.1);
        }

        //检测信息是否超过定义条数量
        let max = 15;
        let length = this.scrollViewConent.children.length;
        if (length > max) {
            let m = length - max;
            for (let i = 0; i < m; i++) {
                this._chatPool.put(this.scrollViewConent.children[i]);
            }
        }
    },
    on_msg:function(event){
        var msg = event.detail;
        cc.log (JSON.stringify(msg));
        var code = msg.header.code;
        var mask = code >> 28;
        var appCode = (0x0FFFFFFF&code)>>16;
        var cmd = code & 0x0000FFFF;
        cc.log (mask,appCode,cmd);
        if ( mask == 4)
        {
            cc.log ("msg has been  to target");
        }
        else if (mask == 2)
        {
            var uid = msg.header.uid;
            var txt = msg.body.msg;
            cc.log (uid  + " say:" +txt);    
          this.createChatMsg (uid,txt);
        }

    }   
});
