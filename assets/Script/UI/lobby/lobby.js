cc.Class({
    extends: require('NetComponent'),
  // extends: require('NetData'),
    properties: {
        nameLB: cc.Label,   //用户名
        roomEditBox:cc.EditBox,  // 房间号
        roomlistLayer:cc.Node,
        roomItem:cc.Prefab,
        roomTmpIndex:0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
       
    },

    start () {
        var city = GameData.getSelfCity()
        var name = GameData.getSelfName()
        this.nameLB.string = city+"玩家 "+ name;
        
        if (Object.keys(GameData.lobbyRoomDetailMap).length > 0){
            this.initRoomList();
        }else{
            this.onBtnRoomList();
        }
        
    },

    onEnable() {
        this._super();
        //NetTarget.on('chat', this.on_msg.bind(this));
        NetDataGloble.on('lobby.rsp',this, this.getLobbyRspData);
        NetDataGloble.on('chat',this, this.on_msg);
    },
    onDisable() {
         
       // NetTarget.off('chat', this.on_msg.bind(this));
       NetDataGloble.off('lobby.rsp', this.getLobbyRspData)
       NetDataGloble.off('chat', this.on_msg)
       this._super();  
    },

    

    onBtnRoomList:function(){
        cc.log("onBtnRoomList");
        var b = {};
        b.app_code = GameData.chatAppCode;
        var cmd = Define_Lobby.GET_ROOM_LIST;  // get room list
        var appCode = Define_App_Code.MT_LOBBY; // lobby  is 0xff1
        Network.sendReq(appCode,cmd,b);
        this.openRoomList();
    },
    onBtnCreateRoom:function(){
        Network.requestToken(function(code,body){
            cc.log("onBtnCreateRoom");
            var b = {};
            b.app_code = GameData.chatAppCode;
            b.token = body.u_token;
            var info = {};
            info["n_extra"] = 12234;
            info["room_name"] = "房间";
            info["n_user_count"] = 10;
            b.room_info = JSON.stringify(info);
            var cmd = Define_Lobby.CREATE_ROOM;  // create room
            var appCode = Define_App_Code.MT_LOBBY; // lobby  is 0xff0
            Network.sendReq(appCode,cmd,b);
        })
      
    },
    onBtnRoomInfo:function(){
        cc.log("onBtnRoomInfo");

    },
    onBtnEnterRoom:function(roomid){
        var str = this.roomEditBox.string;
        cc.log ("room id = ",str);
        var rid = parseInt (str);
        var b = {};
        b.app_code = GameData.chatAppCode;
        b.room_id = roomid;
        var cmd = Define_Lobby.ENTER_ROOM;  //  room
        var appCode = Define_App_Code.MT_LOBBY; // account  is 0xff0
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
        //cc.log("getLobbyRspData");
        this._super(event);   
        var msg = event;
        cc.log ("lobby rsp:", JSON.stringify(msg));
        var code = msg.code;
        var result = msg.result;
        if (result != 0)
        {
            // error
            return;
        }
        var cmd = code & 0x0000FFFF;

        let test1 = this 
        cc.log(test1)
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
            case 4:
            this.on_leave_room(msg.body);
            break;
            case 6:
            this.on_get_room_detail(msg.body);
            break;
            default:
            cc.log ("lobby msg not registed:", cmd);
            break;
        }
    },
    on_create_room :function(body)
    {
        cc.log ("on create_room",JSON.stringify(body));
       // cc.sys.localStorage.setItem('room_id',body.u_rid);
        GameData.setCurrentRoomId(GameData.chatAppCode,body.u_rid)
        body.room_info.u_rid = body.u_rid;
        body.info = body.room_info;
        GameData.setRoomInfo(body.info.u_rid,body)
        cc.director.loadScene("chatRoom");
    },
    on_enter_room:function(body)
    {
        cc.log ("on_enter_room",JSON.stringify(body));
        //cc.sys.localStorage.setItem('room_id',body.room_id);
        GameData.setCurrentRoomId(GameData.chatAppCode,body.u_rid)
        cc.director.loadScene("chatRoom");
    },

    on_leave_room:function(body)
    {
        cc.log ("on_leave_room",JSON.stringify(body));
        //cc.sys.localStorage.setItem('room_id',body.room_id);
        GameData.removeCurrentRoomId(body.app_code,body.u_rid);
    },
    on_get_room_list:function(body)
    {
        cc.log ("on on_get_room_list",JSON.stringify(body));
        if ( body.room_ids)
        {   
            this.roomTmpIndex = 0
            GameData.lobbyRoomBaseList = body.room_ids;
            GameData.lobbyRoomDetailMap = {};
           
            this.schedule(function(){
                if ( this.roomTmpIndex == GameData.lobbyRoomBaseList.length){
                     //do something
                }
                this.on_req_room_Info_detail()
            },0.01,GameData.lobbyRoomBaseList.length,0)
        }
       
    },
    on_req_room_Info_detail:function()
    {   
        if (GameData.lobbyRoomBaseList[this.roomTmpIndex])
        {
            var b = {};
            b.app_code = GameData.chatAppCode;
            b.u_rid =parseInt(GameData.lobbyRoomBaseList[this.roomTmpIndex]);
            var cmd = Define_Lobby.GET_ROOM_INFO;  
            var appCode = Define_App_Code.MT_LOBBY; 
            Network.sendReq(appCode,cmd,b);
            this.roomTmpIndex = this.roomTmpIndex + 1;
        }
        
    },

    on_get_room_detail:function(body)
    {   
       
        GameData.setRoomInfo(body.u_rid,body)
        var test = Object.keys(GameData.lobbyRoomDetailMap).length;
        if  (Object.keys(GameData.lobbyRoomDetailMap).length  >= GameData.lobbyRoomBaseList.length){
            this.initRoomList();
        }
        
        
       
    },

    getAccountRspData:function(event) {
        this._super(event);
        var msg = event;
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
            var uid = msg.header.uid;
            var txt = msg.body.msg;
            cc.log (uid  + " say:" +txt);
        }
        else if (mask == 3) // ntf //通知广播
        {
            switch (cmd)
            {
                case 0xFFF0:GameData.updateRoomInfoUserCount(msg.body); break;
                case 0xFFF1: GameData.setUserInfo(msg.body); break;//刷新玩家列表
                //case 0xFFF2:  GameData.setRoomInfo(msg.body); break;//roominfo
                cc.log (cmd, "----> " ,JSON.stringify(msg.body));
                break;
        
            }
        }
    },

    initRoomList : function () {

      var roomListContent = cc.find('view/content',this.roomlistLayer);
      //var height = cc.instantiate(this.roomItem).height;
        /*
          var index = 0;
          let roomItemNode;
          for(var i=0;i<10;i++){
            roomItemNode = cc.instantiate(this.roomItem);
            roomListContent.addChild(roomItemNode);
            if(roomListContent.childrenCount > 2){
                roomListContent.height = Math.floor(roomListContent.childrenCount/2) * roomItemNode.height;
            }
          }
          */
          for(var roomId in GameData.lobbyRoomDetailMap){
                let roomItemNode = cc.instantiate(this.roomItem);
                roomListContent.addChild(roomItemNode);
                roomItemNode.getComponent('lobbyRoomItem').setRoomNumL(GameData.lobbyRoomDetailMap[roomId].info["u_rid"]);
                roomItemNode.getComponent('lobbyRoomItem').setUserCountL(GameData.lobbyRoomDetailMap[roomId].info.n_user_count);
                roomItemNode.getComponent('lobbyRoomItem').setRoomNameL(GameData.lobbyRoomDetailMap[roomId].info.room_name);
                if(roomListContent.childrenCount > 2){
                    roomListContent.height = Math.floor(roomListContent.childrenCount/2) * roomItemNode.height;
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
