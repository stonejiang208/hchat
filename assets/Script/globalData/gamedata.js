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
    GameData.lobbyRoomDetailList = [];//房间列表详细信息

    GameData.currentRoomID = []; //当前进入的房间的房间号

    GameData.chatAppCode = 321; //聊天的appcode

    
};

//注册事件
GameData.getLobbyRspData = function () {
    this._super();
    cc.log('111');
};
//set
GameData.setUserInfo = function (uid,useInfo) {
    GameData.userInfo[uid] = useInfo;
};
GameData.setRoomInfo = function (roomId,roomInfo) {
    GameData.room[roomId] = roomInfo;
}
//get
GameData.getUserInfo = function(uid) {
    // var info = {userId:uid,userName:"noname",userLevel:1};1
    return GameData.userInfo[uid];
};

//TODO 设计一个map 来直接查找房间信息通过房间号 来替换下面这个循环遍历
GameData.getRoomInfo = function (roomId) {
    for(var i = 0;i< GameData.lobbyRoomDetailList.length;i++){
        var tempInfo = GameData.lobbyRoomDetailList[i]
        if (tempInfo.info["u_rid"] == roomId){
            return GameData.lobbyRoomDetailList[i];
        }
    }
}

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

//updaTe roomInfo userCount 更新房间人数
GameData.updateRoomInfoUserCount = function(body){
    for(var i = 0;i< GameData.lobbyRoomDetailList.lenth;i++){
        var tempInfo = GameData.lobbyRoomDetailList[i]
        if (tempInfo.info["n.rid"] == body["u_rid"]){
            GameData.lobbyRoomDetailList[i].info.n_user_count = body.user_num;
            break;
        }
    }
    var b = {};
    b.room_id = body["u_rid"];
    b.user_count = body.n_user_num;
    TopicGloble.emit('chatMainUserCount',b);
}


