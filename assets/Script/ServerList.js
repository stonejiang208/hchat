
cc.Class({
    extends: cc.Component,

    properties: {
        scrollViewConent:cc.Node,
        serverItem:cc.Prefab,
    },

    onLoad:function() {
        cc.log ("ServerList::onLoad");
        this.initServerList();
    },
    

    start :function() {
        cc.log ("ServerList::start");
    },

    initServerList:function(){
        cc.log ("initServerList");
        var data = [
            {Name:"server1",Num:1234},
            {Name:"server2",Num:33},
            {Name:"server3",Num:33},
            {Name:"server1",Num:1234},
            {Name:"server2",Num:33},
            {Name:"server3",Num:33},
        ];
        for (var i = 0; i<data.length; i++) {
            var serverItem = cc.instantiate(this.serverItem);
            serverItem.name = i +'';
            serverItem.on(cc.Node.EventType.TOUCH_END,this.selectServerItem,this);
            var item = serverItem.getComponent('serverItem');
            item.serverName.string = data[i].Name;
            item.peopleNum.string = data[i].Num;
            this.scrollViewConent.addChild(serverItem);
            //var heigth = this.serverItem.getContentSize().height;
            serverItem.y = -43 - i*80;
        }
        //set content height
        this.scrollViewConent.height = data.length * 80;


    },
    selectServerItem: function (e) {
      cc.log('-----'+e.target.name);

    }

});
