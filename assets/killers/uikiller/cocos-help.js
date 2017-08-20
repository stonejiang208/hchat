/**
 * zxh 
 * 此文件为cocos引擎中的 api对象创建原型函数
 */
let _ = require('lodash');

/**
 * 通过资源实例化预制对象
 * @param res   资源字符串
 * @param cb    回调函数返回
 */
function createPrefab(res, cb) {
    cc.loader.loadRes(res, cc.Prefab, (error, prefab) => {
        let node = null;
        if (error) {
            cc.error(`createPrefab ${error}`);
        } else {
            node = cc.instantiate(prefab);
        }
        
        if (cb) {
            cb(error, node);
        }
    });  
}

/**
 * 通过资源路径（预制）创建节点, 根据 sender 类型并完成节点挂接
 * @param sender
 * @param res
 * @param cb
 */
cc.Component.prototype.createNode = function createNode(sender, res, cb) {
    cc.log(`createNode ${res}`);
    createPrefab(res, (error, node) => {
        if (sender instanceof cc.Node) {
            sender.addChild(node);
        } else if (this.node && this.node instanceof cc.Node) {
            this.node.addChild(node, 0);
        }
        
        if (cb) {
            cb(node);
        }
    });
};

/**
 * 删除组件上的节点
 */
cc.Component.prototype.removeNode = function removeNode() {
    if (!this.node) {
        return;
    }

    if (this.node.mediator && this.node.mediator.destroyViewComponent) {
        this.node.mediator.destroyViewComponent();
    } else {
        this.node.destroy();
    }
};

cc.Node.prototype.hasComponent = function (types) {
    if (!_.isArray(types)) {
        types = [types];
    }

    let component = _.find(types, (type) => {
        return this.getComponent(type);
    });

    return !!component;
};

/**
 * 1.button 控件禁用时同步 node 节点 interactable属性
 * 2.button 控件禁用时,设置子节 sprite 点为灰
 * @type {cc.Button._updateState|*}
 */
let buttonUpdateState = cc.Button.prototype._updateState;
cc.Button.prototype._updateState = function () {

    buttonUpdateState.call(this);
    // if (CC_EDITOR) {
    //     return;
    // }
    if (this.node.interactable === this.interactable) {
        return;
    }

    this.node.interactable = this.interactable;
    if (this.enableAutoGrayEffect && this.transition !== cc.Button.Transition.COLOR) {
        if (!(this.transition === cc.Button.Transition.SPRITE && this.disabledSprite)) {
            this.node.children.forEach((node) => {
                let sprite = node.getComponent(cc.Sprite);
                if (sprite) {
                    sprite._sgNode.setState(this.interactable ? 0 : 1);
                }
            });
        }
    }
};


/**
 * 获取精灵上的纹理文件名
 * @returns {*}
 */
cc.Sprite.prototype.getTextureFilename = function getTextureFilename() {
    if (this.spriteFrame) {
        let fileName = this.spriteFrame._textureFilename;
        const index = fileName.indexOf('resources/');
        return fileName.substr(index + 10);
    }

    return '';
};

/**
 * 获取图集中的 spriteFrame
 * @param atlas
 * @param key
 * @returns {*}
 */
cc.getSpriteFrameByAtlas = function getFrameByAtlas(atlas, key) {
    let path = cc.path.mainFileName(atlas);
    let spriteAtlas = cc.loader.getRes(path, cc.SpriteAtlas);
    if (spriteAtlas) {
        return spriteAtlas.getSpriteFrame(key);
    }
    return null;
};

/**
 * 屏幕截图
 * @param fileName
 * @param cb
 */
cc.screenShoot = function (node, fileName, cb) {
    if (!cc.sys.isNative) return;

    if (arguments.length === 1) {
        if (_.isFunction(fileName)) {
            cb = fileName;
            fileName = null;
        }
    }

    let savePath = `${jsb.fileUtils.getWritablePath()}/ScreenShoot/`;
    if (!jsb.fileUtils.isDirectoryExist(savePath)) {
        jsb.fileUtils.createDirectory(savePath);
    }

    let name = fileName || `img-${Date.now()}.png`;

    let imagePath = savePath + name;
    let size = cc.director.getVisibleSize();

    let rt = cc.RenderTexture.create(size.width, size.height, cc.Texture2D.PIXEL_FORMAT_RGBA8888, gl.DEPTH24_STENCIL8_OES);
    node = cc.find('Canvas');
    rt.begin();
    node._sgNode.visit();
    rt.end();
    rt.saveToFile(`ScreenShoot/${name}`, 1, true, (texture, fileName) => {
        cc.log(`save succ: ${fileName}`);
        rt.removeFromParent();
        if (cb) {
            cb(imagePath);
        }
    });
};

cc.createNodeComponent = function (componentType) {
    let node = new cc.Node();
    let component = node.addComponent(componentType);
    return component;
};