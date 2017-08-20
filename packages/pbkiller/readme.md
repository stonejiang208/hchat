# pbkiller说明
pbkiller插件是为了在CocosCreator中简化protobufjs的使用，并且可以运行在浏览器、jsb上。
# pbkiller安装
插件pbkiller成功后通过，主菜单->扩展->pbkiller->install。
安装完成后，会导入如下文件：
1. protobufjs源码
2. pbkiller源码、及fs/path伪装模块
3. 简单的测试场景和代码
4. 测试proto文件

下面是导入文件和目录结构：
```
pbkiller					
├── protobuf				protobufjs源码
│   ├── bytebuffer.js
│   ├── long.js
│   └── protobufjs.js
├── src						pbkiller源码
│   ├── fs.js				fs伪装
│   ├── path.js				path伪装
│   └── pbkiller.js			pbkillers核心代码
└── test
    ├── test-pbkiller.fire	测试场景
    └── test-pbkiller.js	测试组件代码
resources					
└── pb			  resource/pb是pbkiller默认的proto文件存放的根目录
    ├── ActionCode.proto
    ├── ChatMsg.proto
    ├── Player.json
    └── Player.proto
```

# 使用方法

### 快速使用
导入pbkiller模块
```
let pbkiller = require('pbkiller');
```

加载resources/pb目录下所有proto文件
```
//加载所有proto文件
let pb = pbkiller.loadAll(); 
//实例化proto中的Player对象
let player = new pb.grace.proto.msg.Player();
```

指定文件格式：[proto|json],默认为proto
```
//注意json文件是由protobufjs提供的pbjs工个生成
let pb = pbkiller.loadAll('json');
```

指定编译的对象路径
```
let pb = pbkiller.loadAll('proto', 'grace.proto.msg');
cc.log(new pb.Player());
```


# 注意

在加载proto时可以使用扩展名为proto和json，pbkiller支持两种混用，但注意的如果有proto之间有依赖关系，请保证依赖文件之间是相同的文件格式。
