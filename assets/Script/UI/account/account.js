

cc.Class({
    extends: require('NetComponent'),

    properties: {
        editBoxOpenId:cc.EditBox
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        var d = new Date();
        var now = d.getTime();
        this.editBoxOpenId.string = "gp." + now.toString();
    },

    btnCreateAccount:function(){
        
       // for (var i = 0; i < 200; i++) {
        cc.log ("create account");

        var p = {};
        p.openid = this.editBoxOpenId.string;
        p.openid_type = "gp";

        var info = {};
        info["d_value"] = 1234.5;
        p.info = JSON.stringify(info);

        var cmd = Define_Account.CREATE_ACCOUNT;
        var appCode = Define_App_Code.MT_ACCOUNT; // account  is 0xff0
        
        Network.sendReq(appCode,cmd,p);

        cc.log (JSON.stringify(p));
       // }
    },


    btnGuest:function(){
      cc.log ("btnGuest");
    },
    // update (dt) {},
});
