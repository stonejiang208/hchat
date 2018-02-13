function Topic() {
    this.handlers = {};
    this.super = {};
  }
  Topic.prototype = {
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
         if (self.handlers[eventType]) {
            var handlerArgs = Array.prototype.slice.call(arguments,1);
            for(var i = 0; i < self.handlers[eventType].length; i++) {
              self.handlers[eventType][i].apply(this.super[eventType][i],handlerArgs);
            }
          return self;
         }
         
      },
      // 删除订阅事件
      off: function(eventType, handler){
          var currentEvent = this.handlers[eventType];
          var thisSuper = this.super[eventType];
          var len = 0;
          if (currentEvent) {
               len = currentEvent.length;
              for (var i = len - 1; i >= 0; i--){
                    if (currentEvent[i] === handler){
                      currentEvent.splice(i, 1);
                      thisSuper.splice(i,1);
                    }
              }
          }
          return this;
      },

      //数据部分

  };
  
  var TopicGloble = new Topic();