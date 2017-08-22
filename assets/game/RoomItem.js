let UIKiller = require('../killers/uikiller/uikiller');

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad() {
        UIKiller.bindComponent(this);
    },

    setData(data) {
        this.data = data;
        this._nameLabel.$Label.string = data.name;
        this._userCountLabel.$Label.string = data.userCount;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
