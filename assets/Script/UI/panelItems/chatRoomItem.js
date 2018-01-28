cc.Class({
    extends: cc.Component,

    properties: {
        roomId:cc.Label,
    },

    // use this for initialization
    onLoad: function () {

    },
    setRoomid:function (roomid) {
        this.roomId.string = '房间号：'+roomid;
    },
    enterRoom: function (eve) {
        eve.on(cc.Node.EventType.TOUCH_START,function () {
            var roomId = parseInt(this.name);
            var b = {};
            b.app_code = 321;
            b.room_id = roomId;
            var cmd = 2;  //  room
            var appCode = 0xFF1; // account  is 0xff0
            Network.sendReq(appCode,cmd,b);
            cc.log("onBtnEnterRoom");
        },this);
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
