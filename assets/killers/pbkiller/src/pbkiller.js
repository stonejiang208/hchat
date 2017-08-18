let ProtoBuf = require('protobufjs');
ProtoBuf.Util.IS_NODE = cc.sys.isNative;

module.exports = {
    root: 'pb',
    /**
     * 加载文件proto文件，支持json、proto格式
     * @param {String|Array} files 
     */
    loadFromFile(fileNames, packageName) {
        if (typeof fileNames === 'string') {
            fileNames = [fileNames];
        }

        let builder = ProtoBuf.newBuilder();
        builder.importRoot = cc.url.raw(`resources/${this.root}`);

        fileNames.forEach((fileName) => {
            let extname = cc.path.extname(fileName); 
            let fullPath = `${builder.importRoot}/${fileName}`;
            if (extname === '.proto') {
                ProtoBuf.loadProtoFile(fullPath, builder); 
            } else if (extname === '.json') {
                ProtoBuf.loadJsonFile(fullPath, builder);
            } else {
                cc.log(`nonsupport file extname, only support 'proto' or 'json'`);
            }
        });

        return builder.build(packageName);
    },

    /**
     * 加载所有proto文件
     * @param {String} extname 
     * @param {String} packageName 
     */
    loadAll(extname = 'proto', packageName = '') {
        let files = [];
        if (this.root.endsWith('/') || this.root.endsWith('\\')) {
            this.root = this.root.substr(0, this.root.length - 1);
        }
        
        //获取this.root下的所有文件名
        cc.loader._resources.getUuidArray(this.root, null, files);
        files = files.map((filePath) => {
            let str = filePath.substr(this.root.length + 1);
            return `${str}.${extname}`;
        });
        return this.loadFromFile(files, packageName);
    }

}