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
GameData.getRoomInfo = function (roomId) {
    return GameData.room[roomId];
}

//updaTe roomInfo userCount 更新房间人数
GameData.updateRoomInfoUserCount = function(roomId,userCount){
    for(var i = 0;i< GameData.lobbyRoomDetailList.lenth;i++){
        var tempInfo = GameData.lobbyRoomDetailList[i]
        if (tempInfo.info["n.rid"] == roomId){
            GameData.lobbyRoomDetailList[i].info.n_user_count = userCount;
            break;
        }
    }
}


