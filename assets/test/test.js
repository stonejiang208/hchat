let UIKiller = require('../killers/uikiller/uikiller');
let PBKiller = require('../killers/pbkiller/src/pbkiller');
let Socket = require('../killers/netkiller/socket');
let pbmap = require('../killers/pbkiller/src/pbmap');
cc.Class({
    extends: cc.Component,

    properties: {
        logLabel: cc.Prefab,    
    },

    // use this for initialization
    onLoad: function () {
        UIKiller.bindComponent(this);
        PBKiller.init('happyChat.msg');
    },

    addLog(data) {
        let string = typeof data === 'string' ? data : JSON.stringify(data, null, 4);
        let node = cc.instantiate(this.logLabel);
        let label = node.getComponent(cc.Label);
        this._scrollView.$ScrollView.content.addChild(node);
        label.string = string;
    },

    addErrorLog(error, detail) {
        if (error) {
            this.addLog(`错误码:${error}`);
        }

        if (detail) {
            this.addLog(detail.message);
        }    
    },

    _onConnectTouchEnd() {
        if (this.socket) {
            this.addLog('已经连接上服务器了');
            return;
        }

        let address = this._editBox.$EditBox.string;
        if (!address) {
            this.addLog('地址不能为空');
            return;
        }

        this.socket = new Socket(address);
        this.socket.on(Socket.Event.ON_SOCKET_OPEN, () => {
            this.addLog('连接服务器成功');
        });

        this.socket.on(Socket.Event.ON_PUSH_MESSAGE, (push) => {
            this.addLog(push);
        });

        this.socket.on(Socket.Event.ON_SOCKET_CLOSED, () => {
            this.socket = null;
        });
    },

    _onLoginTouchEnd() {
        let req = PBKiller.newReq(pbmap.ActionCode.LOGIN);
        req.account = '1000';
        req.nickname = 'zxh';
        this.socket.request(req, (rsp) => {
            this.addLog(rsp);
        }, this.addErrorLog.bind(this));
    },

    _onEnterHallTouchEnd() {
        let req = PBKiller.newReq(pbmap.ActionCode.ENTER_HALL);
        this.socket.request(req, (rsp) => {
            this.addLog(rsp);    
        }, this.addErrorLog.bind(this));
    },

    _onEnterRoomTouchEnd() {
        let req = PBKiller.newReq(pbmap.ActionCode.ENTER_ROOM);
        req.roomID = 1;
        this.socket.request(req, (rsp) => {
            this.addLog(rsp);    
        }, this.addErrorLog.bind(this));    
    },

    _onSendMessageTouchEnd() {
        let chatMsg = PBKiller.newReq(pbmap.ActionCode.SEND_CHAT_MESSAGE);
        chatMsg.message.text = '测试测试测试测试';
        this.socket.send(chatMsg);   
    }

});
