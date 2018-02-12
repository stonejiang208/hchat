//import { setInterval } from 'timers';

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
        playerNumLb :cc.Label,// 房间玩家人数

        qipaoItem:cc.Prefab,//聊天气泡

        questionBoard:cc.Node,
        questionContent:cc.Label,

        answer_0:cc.Label,
        answer_1:cc.Label,
        answer_2:cc.Label,
        answer_3:cc.Label,
    },
    onEnable() {
        this._super();   
        //NetTarget.on('chat', this.on_msg.bind(this));
        NetDataGloble.on('chat',this, this.on_msg);
        TopicGloble.on('chatMainUserCount',this, this.refreshRoomInfo);
    },
    onDisable() {
           
       // NetTarget.off('chat', this.on_msg.bind(this));
        NetDataGloble.off('chat',this.on_msg);
        TopicGloble.off('chatMainUserCount',this, this.refreshRoomInfo);
        this._super();
    },
    onLoad:function() {
        this._chatPool = new cc.NodePool();
        this._chatMsgIndex = 0;
        this.questionBoard.active = false;
        //var room_id = JSON.parse(cc.sys.localStorage.getItem('room_id'));
        var room_id = GameData.getCurrentRoomId(GameData.chatAppCode);
        if (room_id){
            var roomInfo = GameData.getRoomInfo(room_id)
            if(roomInfo){
                this.roomIdLB.string = "房间编号: "+ room_id;
                this.refreshUI(roomInfo);
            }
        }
        
    },

    start () {
       //通知服务器界面切换完毕
        this.onSceneReady()
    },
    onSceneReady:function(){
        var b = {};
        b.body = {};
        var cmd = 0xFFF3;  // create room
        var appCode = 321; // lobby  is 0xff0
        Network.sendNTF(appCode,cmd,b);
    },

    refreshUI : function (roomInfo) {
        this.playerNumLb.string = roomInfo.info["u_rid"];
    },
    refreshRoomInfo:function (topic) {
        var room_id = GameData.getCurrentRoomId(GameData.chatAppCode);
        if (room_id == topic.room_id){
            this.playerNumLb.string = topic.user_count;
        }
       
    },
    backHallClick:function () {
        // cc.director.loadScene('gameHall');
        cc.director.loadScene('Lobby');
    },

    sendChatClick:function(eve){
        var str = this.chatEditBox.string;
        cc.log('聊天内容:'+str);

  /*   注释的代码是作压力测试时自动发送消息的示例。
       var j = 0;
       setInterval(()=>{
           j++;
           if (j < 2000){
                var b = {};
                b.msg = str + ":" + j;
                var cmd = 1;  // get room list
                var appCode = 321; // account  is 0xff0
                Network.sendReq(appCode,cmd,b);
            }
        },500)*/

         var b = {};
         b.msg = str;
         var cmd = 1;         // 321 appCode中，1表示发送文本消息
         var appCode = 321;   // 321代表趣味聊天，用户自定义的应用代码

         Network.sendReq(appCode,cmd,b);
    },
    createChatMsg:function (uid,str) {
        var chatItem = this._chatPool.get();
        var userInfo = GameData.getUserInfo (uid);
        var userName = GameData.getUserName(uid)
        this._chatMsgIndex ++ ;
        if (this._chatPool.size() <= 0) {
            chatItem = cc.instantiate(this.qipaoItem);
            var height = chatItem.getContentSize().height;
            chatItem.getComponent('qipaoItem').showMsg(userName + " : " +str);
            chatItem.x = -300;
            chatItem.y =  60/2 - this._chatMsgIndex * 80;
        }
        this.scrollViewConent.addChild(chatItem);
        var height = chatItem.getContentSize().height;
        this.scrollViewConent.height = this.scrollViewConent.children.length * height;
        if (this.scrollViewConent.height > this.scrollViewConent.parent.height) {
            this.chatScrollView.scrollToBottom(0.1);
        }

        //检测信息是否超过定义条数量
        let max = 5;
        let length = this.scrollViewConent.children.length;
        if (length > max) {
            let m = length - max;
            for (let i = 0; i < m; i++) {
                //this._chatPool.put(this.scrollViewConent.children[i]);
            }
        }
    },

    //开始答题
    onBtnStartGame:function(){
        Network.requestToken(function(code,body){
            cc.log("onBtnCreateRoom");
            var b = {};
            b.token = body.u_token;
            var cmd = 4;  // create room
            var appCode = 321; // lobby  is 0xff0
            Network.sendReq(appCode,cmd,b);
        })
      
    },
    on_msg:function(event){
        var msg = event;
        cc.log (JSON.stringify(msg));
        var code = msg.header.code;
        var mask = code >> 28;
        var appCode = (0x0FFFFFFF&code)>>16;
        var cmd = code & 0x0000FFFF;
        cc.log (mask,appCode,cmd);
        if ( mask == 4) // ack
        {
            cc.log ("msg has been  to target");
        }
        else if (mask == 5)
        {
            cc.log ("msg has been  to gate");
        }
        else if (mask == 2) // trs
        {
            var uid = msg.header.u_uid;
            var txt = msg.body.msg;
            cc.log (uid  + " say:" +txt);    
          this.createChatMsg (uid,txt);
        }
        else if (mask == 3) // ntf 
        {
            switch (cmd)
            {
                case 0xFFF0: GameData.updateRoomInfoUserCount(msg.body);  createMoveMessage('玩家ID'); break;//playernum
                case 0xFFF1: GameData.setUserInfo(msg.body); break;//刷新玩家列表
                //case 0xFFF2: GameData.setRoomInfo(msg.body); break;//roominfo
                case      3: this.onGameNTF(msg.body);break; //开始答题
                cc.log (cmd, "----> " ,JSON.stringify(msg.body));
                break;
            }
            //this.refreshUI();
        }
    } ,
    
    onGameNTF:function(body){
        switch(body.type)
        {
            case 1: this.showTime(body.b);break;
            case 2: this.showQuestion(body.b);break;
            case 3: this.refreshRankList(body.b);break;
            case 4: this.onGameEnd(body.b);break;
        }
    },

    showTime:function(body){
        createMoveMessage("count_down"+body.count_down)
    },

    showQuestion:function(body){
        this.initQuestion(body)
    },

    initQuestion:function(body){
        this.questionBoard.active = true;
        this.questionContent.string = body.question;
        this.answer_0.string = body.choise_a;
        this.answer_1.string = body.choise_b;
        this.answer_2.string = body.choise_c;
        this.answer_3.string = body.choise_d;
    },

    //选项
    onSelectAnsWer:function(event,tag)
    {
        var answer = parseInt(tag)
        var b = {};
        b.answer = answer -1;
        var cmd = 2;         // 321 appCode中，1表示发送文本消息
        var appCode = 321;   // 321代表趣味聊天，用户自定义的应用代码
        Network.sendReq(appCode,cmd,b);

    },
   

    refreshRankList:function()
    {

    },

    onGameEnd:function(){
        this.questionBoard.active = false;
    },

    update (dt) 
    {
        
    },
});
