function NetData() {
    this.handlers = {};
    this.super = {};
    this.MasterData = {};
  }
  NetData.prototype = {
        // 订阅事件
        on: function(eventType,_super, handler){
          var self = this;
          if(!(eventType in self.handlers)) {
             self.handlers[eventType] = [];
          }
         if(!(eventType in self.super)){
          self.super[eventType] = [];
         }
          self.handlers[eventType].push(handler);
          self.super[eventType].push(_super)
          return this;
      },
       // 触发事件(发布事件)
      emit: function(eventType){
         var self = this;
         var handlerArgs = Array.prototype.slice.call(arguments,1);
         for(var i = 0; i < self.handlers[eventType].length; i++) {
          // var test = self.handlers[eventType][i]._super()
           self.handlers[eventType][i].apply(this.super[eventType][0],handlerArgs);
           //self.handlers[eventType][i](handlerArgs);
         }
         return self;
      },
      // 删除订阅事件
      off: function(eventType, handler){
          var currentEvent = this.handlers[eventType];
          var len = 0;
          if (currentEvent) {
               len = currentEvent.length;
              for (var i = len - 1; i >= 0; i--){
                    if (currentEvent[i] === handler){
                      currentEvent.splice(i, 1);
                    }
              }
          }
          this.super[eventType] = [];
          return this;
      },

      //数据部分

  };
  
  var NetDataGloble = new NetData();
  cc.log("111111111111111111111")
