/**
 * Created by jiangtao on 28/01/2018.
 */
function createMoveMessage(content) {
    var onResLoaded = function (err, res) {
        var point = cc.director.getWinSize();
        var messageNode = cc.instantiate(res);
        messageNode.setPosition(cc.p(point.width / 2, point.height / 2));
        cc.find('Label', messageNode).getComponent(cc.Label).string = content + '';
        cc.director.getScene().addChild(messageNode);
    };
    cc.loader.loadRes('Panel/MoveMessage', onResLoaded);
}