// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

cc.Class({
    extends: require('NetComponent'),

    properties: {
        editBoxOpenId:cc.EditBox
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        var d = new Date();

        this.editBoxOpenId.string = "gp"+d.getTime();
    },

    btnCreateAccount:function(){
        
       // for (var i = 0; i < 200; i++) {
        cc.log ("create account");

        var p = {};
        p.openid = this.editBoxOpenId.string;
        p.openid_type = "gp";

        var info = {};
        info["d.value"] = 1234.5;
        p.info = JSON.stringify(info);

        var cmd = 1;
        var appCode = 0xFF0; // account  is 0xff0
        
        Network.sendReq(appCode,cmd,p);

        cc.log (JSON.stringify(p));
       // }
    },


    btnGuest:function(){
      cc.log ("btnGuest");
    },
    // update (dt) {},
});
