var GameData =  {};
GameData.init = function () {
    GameData.client = {
        appCode:0,
        uid:0,
        sex:1,
    };
    GameData.selfInfo = {};
    GameData.userInfo = [];
    GameData.game = {};
    GameData.room = {};

    GameData.lobbyRoomBaseList = {}; // 房间列表简化信息

    GameData.lobbyRoomDetailMap = {}; //通过键值对存储的房间详细信息列表 键是房间号u_rid

    GameData.currentRoomID = []; //当前进入的房间的房间号

    GameData.chatAppCode = 321; //聊天的appcode

    
};

//注册事件
GameData.getLobbyRspData = function () {
    this._super();
    cc.log('111');
};

//操作自己的信息begin

GameData.setSelfInfo = function(mySelf){
    var userInfo = JSON.parse(mySelf);
    userInfo.info = JSON.parse(userInfo.info);
    GameData.selfInfo = userInfo;
};

//获取自己的uid
GameData.getSelfUid= function(){
    return GameData.selfInfo.info.u_uid;
}

//获取自己的名字
GameData.getSelfName = function(){
    return GameData.selfInfo.info.name;
}

//获取自己登陆城市 
GameData.getSelfCity = function(){
    var str_city = GameData.selfInfo.info.last_location;
    str_city = JSON.parse(str_city);
    if(str_city[2]){
        return str_city[2];
    }
    if(str_city[1]){
        return str_city[1];
    }
    if(str_city[0]){
        return str_city[0];
    }
    return "未知";
}



//操作自己的信息end

//set
GameData.setUserInfo = function (userInfoList) {
    GameData.userInfo = [];
    for(var i = 0;i<userInfoList.user_list.length;i++){
        var userInfo = userInfoList.user_list[i]
        GameData.userInfo[userInfo.u_uid] = userInfo;
    }
};

GameData.addUserInfo = function(uid,userInfo){
    GameData.userInfo[uid] = userInfo;
}

GameData.setRoomInfo = function (roomId,roomInfo) {
    GameData.lobbyRoomDetailMap[roomId] = roomInfo;
}
//get
GameData.getUserInfo = function(uid) {
    // var info = {userId:uid,userName:"noname",userLevel:1};1
    return GameData.userInfo[uid];
};

//获取玩家名字
GameData.getUserName = function(uid){
    var userInfo = GameData.getUserInfo(uid);
    return userInfo.name
},

//TODO 设计一个map 来直接查找房间信息通过房间号 来替换下面这个循环遍历
GameData.getRoomInfo = function (roomId) {
    return GameData.lobbyRoomDetailMap[roomId];
},

GameData.removeRoomInfo = function(roomId){
    GameData.lobbyRoomDetailMap[roomId] = null;
},

//
GameData.setCurrentRoomId = function(appCode,roomId){
    if(!(GameData.currentRoomID[appCode])){
        GameData.currentRoomID[appCode] = [];
    }
    GameData.currentRoomID[appCode] = roomId;
}

GameData.getCurrentRoomId = function(appCode){
    return GameData.currentRoomID[appCode];
}

GameData.removeCurrentRoomId = function(appCode,roomId){
    GameData.currentRoomID[appCode] = null;
},

//updaTe roomInfo userCount 更新房间人数
GameData.updateRoomInfoUserCount = function(body){
    GameData.lobbyRoomDetailMap[body["u_rid"]].info.n_user_count =  body.n_user_num;
    var b = {};
    b.room_id = body["u_rid"];
    b.user_count = body.n_user_num;
    TopicGloble.emit('chatMainUserCount',b);
}


