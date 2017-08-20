let pbkiller = require('../src/pbkiller');

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad: function () {
        //this.loadProto();
    },

    loadProto() {
        //loadAll自动加载resources/pb下所有proto
        let pb = pbkiller.loadAll();
        cc.log(JSON.stringify(pb.grace.proto.msg));

        //loadAll自动加载resources/pb下所有proto
        pb = pbkiller.loadAll('proto', 'grace.proto.msg');
        cc.log(JSON.stringify(new pb.Player()));

        //loadFromFile加载指定文件
        pb = pbkiller.loadFromFile('Player.proto', 'grace.proto.msg');
        cc.log(JSON.stringify(new pb.Player()));

        //loadFromFile加载resources/pb下指定文件
        pb = pbkiller.loadFromFile(['Player.proto', 'ActionCode.proto'], 'grace.proto.msg');
        cc.log(JSON.stringify(new pb.PBMessage()));

        //loadFromFile加载resources/pb下指定文件
        pb = pbkiller.loadFromFile(['Player.json', 'ActionCode.proto'], 'grace.proto.msg');
        cc.log(JSON.stringify(new pb.Player()));
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
