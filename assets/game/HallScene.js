
let UIKiller = require('../killers/uikiller/uikiller');
let PBKiller = require('../killers/pbkiller/src/pbkiller');
let pbmap = require('../killers/pbkiller/src/pbmap');
let socket = require('../killers/netkiller/netkiller');


cc.Class({
    extends: cc.Component,

    properties: {
        roomItem: cc.Prefab
    },

    // use this for initialization
    onLoad() {
        UIKiller.bindComponent(this);
        PBKiller.init('happyChat.msg');
        socket.connect('ws://lobby.tao-studio.net:6001');
        
        socket.on(socket.Event.ON_SOCKET_OPEN, () => {
            this.login();
        });
    },

    login() {
        let req = PBKiller.newReq(pbmap.ActionCode.LOGIN);
        req.nickname = 'zxh';
        socket.request(req, (rsp) => {
            //登录成功，获取大厅数据
            req = PBKiller.newReq(pbmap.ActionCode.ENTER_HALL);
            socket.request(req, (enterHallRsp) => {
                this.updateRoomList(enterHallRsp.hall);        
            });
        });        
    },


    updateRoomList(hall) {
        let content = this._roomListView.$ScrollView.content;
        hall.roomList.forEach((data) => {
            let roomItem = cc.instantiate(this.roomItem);
            content.addChild(roomItem);
            roomItem.$RoomItem.setData(data);
        });
        
    }


});
