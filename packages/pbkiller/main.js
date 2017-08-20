'use strict';

const fs = require('fs');
const path = require('path');
const async = require('async');
const rd = require('rd');
// const readdir = require('./tools/fs-util').readdir;
const child_process = require('child_process');
      
function mkdir(strPath) {
    try {
        if (fs.existsSync(strPath)) {
            let state = fs.statSync(strPath);
            if (state.isDirectory()) {
                return true;
            }
        }
        if (!mkdir(path.dirname(strPath))) {
            return false;
        }

        Editor.log(`mkdir: ${strPath}`);
        fs.mkdirSync(strPath);
        return true;
    } catch(e) {
        Editor.log(e);
        return false;
    }
}

function copy(src, dist) {
    Editor.log(`copy ${src} > ${dist}`);
    let extname = path.extname(dist);
    let distFile = extname ? dist : path.join(dist, path.basename(src));
    Editor.log('创建目录：',path.dirname(distFile));
    mkdir(path.dirname(distFile));
    fs.createReadStream(src).pipe(fs.createWriteStream(distFile)); 
}

module.exports = {
    _pluginRoot: null,
    _assetsRoot: null,
    load () {
        Editor.log('pbkiller on load');
        
    },

    /**
     * 复制源码到assets/pbkiller
     * @param {Function} cb 
     */
    copyScript(isLite) {
        //读取runtime-scripts下所有文件，复制到assets/lib/pbkiller下
        let scriptRoot = path.join(this._pluginRoot, 'runtime-scripts');

        let scriptFiles = rd.readFileFilterSync(scriptRoot, /\.js$/).sort((a, b) => {
            return b.length - a.length;
        });

        if (isLite) {
            scriptFiles = scriptFiles.filter((str) => {
                return str.indexOf('protobuf') === -1;
            });
        }

        Editor.log(scriptFiles);
        let array = scriptFiles.map((src) => {
            let fileName = src.substr(scriptRoot.length);
            let dist = path.join(this._assetsRoot, 'pbkiller', fileName);
            return { src, dist, fileName };    
        });
        this.copyToAssets(array);
    },

    /**
     * 复制proto文件到assets/resources/pb
     */
    copyProto() {
        let pbRoot = path.join(this._pluginRoot, 'pb');
        let pbFiles = rd.readFileFilterSync(scriptRoot, /\.proto$/);
        let array = pbFiles.map((src) => {
            let fileName = src.substr(pbRoot.length);
            let dist = path.join(this._assetsRoot, 'resources', 'pb', fileName);
            return { src, dist, fileName };    
        });
        this.copyToAssets(array);
    },

    copyToAssets(array) {
        array.forEach((item) => {
            if (fs.existsSync(item.dist)) {
                Editor.log(`文件已经存在，${item.dist}`);
                return;
            }
            copy(item.src, item.dist);
        });
    },

    install(isLite) {
        Editor.log('>>>>>>>>>', JSON.stringify(process.env));
        this._pluginRoot = Editor.url('packages://pbkiller');
        this._assetsRoot = Editor.url('db://assets');
        this.copyScript(isLite),
        this.copyProto(),

        async.series([
            (cb) => Editor.assetdb.refresh('db://assets', cb),
            (cb) => this.installProtoBufNpm(isLite, cb),
        ], (error) => {
            if (error) {
                //Editor.error(error);
                return;
            }
            Editor.success('pbhelper install success');    
        })
    },

    installProtoBufNpm(isLite, cb) {
        let protobufjsPath = path.join(Editor.projectPath, 'node_modules', 'protobufjs');
        if (isLite && !fs.existsSync(protobufjsPath)) {
            Editor.log('检查到没有protobufjs npm模块');
            cb('检查到没有protobufjs npm模块');
            return;
        }
        // Editor.log('>>>>>>>>>', JSON.stringify(process.env));
        // Editor.log('检查到没有protobufjs npm模块，自动安装：npm install protobufjs@5 --save');
        // // let child = child_process.spawn('npm', ['install', 'protobufjs@5', '--save'], {cwd: Editor.projectPath});
        // let child = child_process.spawn('where', ['npm']);
        // child.stdout.on('data', (data) => {
        //     Editor.log(data);
        // })
        // child.on('exit', (code) => {
        //     Editor.log(code ? 'protobufjs安装失败' : 'protobufjs npm模块安装完成');
        //     cb();
        // });
    },

    unload () {
    // execute when package unloaded
    },

  // register your ipc messages here
    messages: {
   
        install() {
            this.install();    
        },

        'install-lite'() {
            this.install(true);
        },
    }
};