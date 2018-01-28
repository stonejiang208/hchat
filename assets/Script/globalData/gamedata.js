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


