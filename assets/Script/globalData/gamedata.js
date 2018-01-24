var GameData = {};
GameData.init = function () {
    GameData.client = {
        appCode:0,

    };
    GameData.playerInfo = {};
    GameData.game = {};
    GameData.room = {};
};

//注册事件
GameData.registerAll ={

},

GameData.getUserInfo = function(uid) {

    var info = {userId:uid,userName:"noname",userLevel:1};

    return info;
}


