//网络组件
let NetworkComponent = cc.Class({
    extends: cc.Component,

    properties: {
    },
    onLoad: function () {

    },

    onEnable() {
        NetTarget.on('net', this.getNetData.bind(this));
        NetTarget.on('netstart', this.netStart.bind(this));
        NetTarget.on('netclose', this.netClose.bind(this));
        NetTarget.on('rsp', this.getRspData.bind(this));
        NetTarget.on('account.rsp', this.getAccountRspData.bind(this));
        NetTarget.on('lobby.rsp', this.getAccountRspData.bind(this));
    },

    onDisable() {
        NetTarget.off('net', this.getNetData.bind(this));
        NetTarget.off('netstart', this.netStart.bind(this));
        NetTarget.off('netclose', this.netClose.bind(this));
        NetTarget.off('rsp', this.getRspData.bind(this));
        NetTarget.off('account.rsp', this.getAccountRspData.bind(this));
        NetTarget.off('lobby.rsp', this.getLobbyRspData.bind(this));
    },
    /**
     * 获取服务端数据
     */
    getNetData: function (event) {
        cc.log("append");
    },

    /**
     * 获取服务端响应
     */
    getRspData: function (event) {
        cc.log("append");
    },

    /**
     * 获取服务端帐号系统的响应
     */
    getAccountRspData: function (event) {
        cc.log("getAccountRspData");
    },
    /**
     * 获取服务端大厅系统的响应
     */
    getLobbyRspData: function (event) {
        cc.log("getLobbyRspData");
    },

    /**
     * 网络连接开始
     */
    netStart: function (event) {
        cc.log("net start");
    },
    /**
     * 网络断开
     */
    netClose: function (event) {
        cc.log("net close");
    },
});
