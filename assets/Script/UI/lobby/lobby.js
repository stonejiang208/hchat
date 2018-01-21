

cc.Class({
    extends: require('NetComponent'),

    properties: {
        nameLB: cc.Label,   //用户名
    },


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        var userInfo = JSON.parse(cc.sys.localStorage.getItem('userInfo'));
        this.nameLB.string = "玩家名称: "+ userInfo.name;
    },

    onBtnRoomList:function(){
        cc.log("onBtnRoomList");
        var b = {};
        b.app_code = 321;
        var cmd = 3;  // get room list
        var appCode = 0xFF1; // account  is 0xff0
        Network.sendReq(appCode,cmd,p);

    },
    onBtnRoomInfo:function(){
        cc.log("onBtnRoomInfo");
    },
    onBtnCreateRoom:function(){
        cc.log("onBtnCreateRoom");
    },
    onBtnEnterRoom:function(){
        cc.log("onBtnEnterRoom");
    },
    onBtnLeaveRoom:function(){
        cc.log("onBtnLeaveRoom");
    },
    onBtnLeaveApp:function(){
        cc.log("onBtnLeaveApp");
    },
    onBtnGetUserInfo:function(){
        cc.log("onBtnGetUserInfo");
    },
    onBtnChangeUserInfo:function(){
        cc.log("onBtnChangeUserInfo");
    },
        /**
     * 获取服务端大厅系统的响应
     */
    getLobbyRspData: function (event) {
        cc.log("getLobbyRspData");
        this._super(event);   
        var msg = event.detail;
        cc.log ("lobby rsp:", JSON.stringify(msg));
        var code = msg.code;
        var result = msg.result;
        if (result != 0)
        {
            // error
            return;
        }
        var cmd = code & 0x0000FFFF;
        switch (cmd)
        {
            case 1:
            break;
        }
    },

    // update (dt) {},
});
