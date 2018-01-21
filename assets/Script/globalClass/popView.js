function openView(panelName,cb)
{
    var child = cc.director.getScene().getChildByName('Canvas').getChildByName(panelName);
    if(child != null)
    {
        child.active = true;
        if(cb != null)
            cb(child);
        return;
    }

    var loadPath = "Panel/" + panelName;
    //cc.log('open panel loadPath : ' + loadPath);

    var onResLoaded = function(err,res)
    {
        var panelNode = cc.instantiate(res);
        panelNode.name = res.name;
        cc.director.getScene().getChildByName('Canvas').addChild(panelNode);
        if(cb != null)
            cb(panelNode);
    }
    cc.loader.loadRes(loadPath, onResLoaded);
}

function closeView(panelName)
{
    cc.log(panelName);
    var child = cc.director.getScene().getChildByName('Canvas').getChildByName(panelName);
    if(child != null)
    {
        cc.log('1');
        child.active = false;
        return;
    }
}