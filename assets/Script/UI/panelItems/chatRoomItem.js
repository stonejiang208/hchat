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
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
