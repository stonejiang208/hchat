cc.Class({
    extends: cc.Component,

    properties: {
        maxWidth: 0,
        box: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        
    },
    
    showMsg: function (str) {
        /*
       var label =  this.box.getChildByName("label");
       label.getComponent(cc.Label).overflow = cc.Label.Overflow.NONE;
       label.getComponent(cc.Label).string = str;
       cc.log()
       cc.log(label.getContentSize().width  + "----------" + this.maxWidth);
        if(label.getContentSize().width >= this.maxWidth){
            cc.log()
            label.getComponent(cc.Label).overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            label.width = this.maxWidth;
            cc.log("resize");
        }
        */
        
        var label =  this.box.getChildByName("label");
        label.getComponent(cc.Label).overflow = cc.Label.Overflow.NONE;
       label.getComponent(cc.Label).string = str;
        var len = str.length*20;
        cc.log(len)
        cc.log(label.width  + "----------" + this.maxWidth);
         if(len >= this.maxWidth){
             cc.log()
             label.getComponent(cc.Label).overflow = cc.Label.Overflow.RESIZE_HEIGHT;
             label.width = this.maxWidth;
             cc.log("resize");
         }
         
    },

    // called every frame
    update: function (dt) {

    },
});
