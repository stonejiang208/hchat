
cc.Class ({
    extends:cc.Component,
    properties:{
        button_1:cc.Button,
        button_2:cc.Button,
        display:cc.Label
    },
    onClickedButton_1:function(){
        cc.log ("onClickedButton_1");
        this.display.string = "on button 1";
    },
    onClickedButton_2:function(){
        cc.log ("onClickedButton_2");
        this.display.string = "on button 2";
    },
});