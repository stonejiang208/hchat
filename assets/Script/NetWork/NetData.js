/*

function NetData() {
    this.handlers = {};

    this.MasterData = {};
  }
  NetData.prototype = {
        // 订阅事件
        on: function(eventType, handler){
          var self = this;
          if(!(eventType in self.handlers)) {
             self.handlers[eventType] = [];
          }
          self.handlers[eventType].push(handler);
          return this;
      },
       // 触发事件(发布事件)
      emit: function(eventType){
         var self = this;
         var handlerArgs = Array.prototype.slice.call(arguments,1);
         for(var i = 0; i < self.handlers[eventType].length; i++) {
           self.handlers[eventType][i].apply(self,handlerArgs);
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
          return this;
      },

      //数据部分

  };
  
  var NetDataGloble = new NetData();
  */
  /*
  var callback = function(data){
      console.log(data);
  };
  //订阅事件A
  NetDataGloble.on('A', function(data){
      console.log(1 + data);
  });
  NetDataGloble.on('A', function(data){
      console.log(2 + data);
  });
  NetDataGloble.on('A', callback);
  
  //触发事件A
  NetDataGloble.emit('A', '我是参数');
  //删除事件A的订阅源callback
  NetDataGloble.off('A', callback);
  NetDataGloble.emit('A', '我是第二次调用的参数');
*/