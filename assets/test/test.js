let UIKiller = require('../killers/uikiller/uikiller');
let PBKiller = require('../killers/pbkiller/src/pbkiller');
let pbmap = require('../killers/pbkiller/src/pbmap');

cc.Class({
    extends: cc.Component,

    properties: {
      
    },

    // use this for initialization
    onLoad: function () {
        UIKiller.bindComponent(this);
        PBKiller.init('happyChat.msg');
    },

    _onLoginTouchEnd() {
        let login = PBKiller.newReq(pbmap.ActionCode.LOGIN);
        login.account = '1000';
        login.nickname = 'zxh';
        
        let data = login.toArrayBuffer();
        let loginReq = PBKiller.proto.LoginReq.decode(data);
        cc.log(loginReq);
    }
});
