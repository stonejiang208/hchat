cc.Class({
    extends: cc.PageView,
    //this is for nested scrollview
    _hasNestedViewGroup: function (event, captureListeners) {
        if(event.eventPhase !== cc.Event.CAPTURING_PHASE) return;

        var touch = event.touch;
        if(!touch) return;
        var deltaMove = cc.pSub(touch.getLocation(), touch.getStartLocation());
        if (deltaMove.x > 7 || deltaMove.x < -7)
            return false;
        // if (deltaMove.y > 7 || deltaMove.y < -7)
        //     return false;
        if(captureListeners) {
            //captureListeners are arranged from child to parent
            for(var i = 0; i < captureListeners.length; ++i){
                var item = captureListeners[i];

                if(this.node === item) {
                    if(event.target.getComponent(cc.ViewGroup)) {
                        return true;
                    }
                    return false;
                }

                if(item.getComponent(cc.ViewGroup)) {
                    return true;
                }
            }
        }

        return false;
    },
});