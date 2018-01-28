

cc.Class({
    extends: require('NetComponent'),

    properties: {
        nameLB: cc.Label,   //用户名
        roomEditBox:cc.EditBox,  // 房间号
        roomlistLayer:cc.Node,
        roomItem:cc.Prefab
    },


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    onEnable() {
        this._super();
        NetTarget.on('chat', this.on_msg.bind(this));
    },
    onDisable() {
        this._super();   
        NetTarget.off('chat', this.on_msg.bind(this));
    },

    start () {
        var userInfo = JSON.parse(cc.sys.localStorage.getItem('userInfo'));
        this.nameLB.string = "玩家名称: "+ userInfo.name;
    },

    onBtnRoomList:function(){
        cc.log("onBtnRoomList");
        var b = {};
        b.app_code = 321;
        var cmd = 3;  // get room list
        var appCode = 0xFF1; // lobby  is 0xff1
        Network.sendReq(appCode,cmd,b);
        this.openRoomList();
    },
    onBtnCreateRoom:function(){
        cc.log("onBtnCreateRoom");
        var b = {};
        b.app_code = 321;
        b.token = 12345678;
        var cmd = 1;  // create room
        var appCode = 0xFF1; // lobby  is 0xff0
        Network.sendReq(appCode,cmd,b);
    },
    onBtnRoomInfo:function(){
        cc.log("onBtnRoomInfo");

    },
    onBtnEnterRoom:function(roomid){
        var str = this.roomEditBox.string;
        cc.log ("room id = ",str);
        var rid = parseInt (str);
        var b = {};
        b.app_code = 321;
        b.room_id = roomid;
        var cmd = 2;  //  room
        var appCode = 0xFF1; // account  is 0xff0
        Network.sendReq(appCode,cmd,b);

        cc.log("onBtnEnterRoom");
    },
    onBtnLeaveRoom:function(){
        cc.log("onBtnLeaveRoom");
    },
    onBtnLeaveApp:function(){
        cc.log("onBtnLeaveApp");
    },
    onBtnGetUserInfo:function(){
        cc.log("onBtnGetUserInfo");
    },
    onBtnChangeUserInfo:function(){
        cc.log("onBtnChangeUserInfo");
    },
    onBtnDisbandRoom:function(){
        cc.log("onBtnDisbandRoom");
    },
     /**
     * 获取服务端大厅系统的响应
     */ 
    getLobbyRspData: function (event) {
        cc.log("getLobbyRspData");
        this._super(event);   
        var msg = event.detail;
        cc.log ("lobby rsp:", JSON.stringify(msg));
        var code = msg.code;
        var result = msg.result;
        if (result != 0)
        {
            // error
            return;
        }
        var cmd = code & 0x0000FFFF;
        switch (cmd)
        {
            case 1:
            this.on_create_room (msg.body);
            break;
            case 2:
            this.on_enter_room (msg.body);
            break;
            case 3:
            this.on_get_room_list(msg.body);
            break;
            default:
            cc.log ("lobby msg not registed:", cmd);
            break;
        }
    },
    on_create_room :function(body)
    {
        cc.log ("on create_room",JSON.stringify(body));
        cc.sys.localStorage.setItem('room_id',body.room_id);
        cc.director.loadScene("chatRoom");
    },
    on_enter_room:function(body)
    {
        cc.log ("on_enter_room",JSON.stringify(body));
        cc.sys.localStorage.setItem('room_id',body.room_id);
        cc.director.loadScene("chatRoom");
    },
    on_get_room_list:function(body)
    {
        cc.log ("on create_room",JSON.stringify(body));
        GameData.room = body.room_ids;
        this.initRoomList();
    },

    getAccountRspData:function(event) {
        this._super(event);
        var msg = event.detail;
        cc.log ("account rsp:", JSON.stringify(msg));
        var code = msg.code;
        var result = msg.result;
        var cmd = code & 0x0000FFFF;
        if (result != 0)
        {
            // error
            cc.log ("rsp error:", cmd,result);
            cc.sys.localStorage.removeItem('userInfo');
            return;
        }
        if (cmd == 1)
        {
            var userInfoJS = JSON.stringify(msg.body);

            cc.sys.localStorage.setItem('userInfo',userInfoJS);
            cc.log ("create account ok");

            var userInfo = JSON.parse(cc.sys.localStorage.getItem('userInfo'));

            cc.log (JSON.stringify(userInfo));
            cc.director.loadScene("Lobby");
        }
        else if (cmd == 2)
        {
            var userInfoJS = JSON.stringify(msg.body);
            cc.sys.localStorage.setItem('userInfo',userInfoJS);
            cc.log ("create account ok");
            cc.director.loadScene("Lobby");
        }
        else if (cmd == 3)
        {
            var body = JSON.stringify(msg.body);
            cc.log (body);
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
            var uid = msg.header.uid;
            var txt = msg.body.msg;
            cc.log (uid  + " say:" +txt);
        }
        else if (mask == 3) // ntf //通知广播
        {
            switch (cmd)
            {
                case 0xFFF0:GameData.room.playerNum = msg.body.user_num; break;
                case 0xFFF1: GameData.setUserInfo(msg.body); break;//刷新玩家列表
                case 0xFFF2:  GameData.setRoomInfo(msg.body); break;//roominfo
                cc.log (cmd, "----> " ,JSON.stringify(msg.body));
                break;
        
            }
        }
    },

    initRoomList : function () {
      if(GameData.room == null || Object.keys(GameData.room).length == 0) {
            return;
      }
      var roomListContent = cc.find('view/content',this.roomlistLayer);
      //var height = cc.instantiate(this.roomItem).height;
      for(let i = 0; i<GameData.room.length ; i++){
          let roomItemNode = cc.instantiate(this.roomItem);
          roomItemNode.name = GameData.room[i];
          roomItemNode.getComponent('chatRoomItem').setRoomid(GameData.room[i]);
          roomItemNode.getComponent('chatRoomItem').enterRoom(roomItemNode);
          roomItemNode.y = -79 - roomItemNode.height * i;
          roomItemNode.x = -318;
          roomListContent.addChild(roomItemNode);
          if(roomListContent.childrenCount > 2){
              roomListContent.height = roomListContent.childrenCount * roomItemNode.height;
          }
      }

    },
    openRoomList : function () {
        this.roomlistLayer.active = true;
    },
    closeRoomList : function (eve) {
        this.roomlistLayer.active = false;
    }
    // update (dt) {},
});
