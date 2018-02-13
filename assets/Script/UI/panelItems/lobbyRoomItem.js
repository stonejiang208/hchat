cc.Class({
    extends: cc.Component,
    properties: {
        userCountL:cc.Label,
        userCountR:cc.Label,
        roomNameL:cc.Label,
        roomNameR:cc.Label,
        roomBtnR:cc.Button,
        roomNumL:0,
        roomNumR:0,
    },

    // use this for initialization
    onLoad: function () {

    },

    setRoomNumL:function(num){
        this.roomNumL = num;
    },

    setRoomNumR:function(num){
        this.roomNumR = num;
    },

    setUserCountL:function (numbers) {
        this.userCountL.string = numbers + '人';
    },

    setUserCountR:function (numbers) {
        this.userCountR.string = numbers + '人';
    },

    setRoomNameL:function(name){
        var userRoomId = GameData.getUserRoomId(this.roomNumL);
        this.roomNameL.string = name+userRoomId;
        
    },

    setRoomNameR:function(name){
        var userRoomId = GameData.getUserRoomId(this.roomNumR)
        this.roomNameR.string = name+userRoomId;
    },

    setRoomBtnRshow:function(){
        this.roomBtnR.active = true;
    },
    enterRoomL: function () {
            var roomId = parseInt(this.roomNumL);
            var b = {};
            b.app_code = 321;
            b.u_rid = roomId;
            var cmd = 2;  //  room
            var appCode = 0xFF1; // account  is 0xff0
            Network.sendReq(appCode,cmd,b);
            cc.log("onBtnEnterRoom");
    },

    enterRoomR: function () {
            var roomId = parseInt(this.roomNumR);
            var b = {};
            b.app_code = 321;
            b.u_rid = roomId;
            var cmd = 2;  //  room
            var appCode = 0xFF1; // account  is 0xff0
            Network.sendReq(appCode,cmd,b);
            cc.log("onBtnEnterRoom");
    },

   
});
