/**
 * Created by zxh on 2017/3/16.
 */
const _ = require('lodash');

/**
 * 不绑定组件节点: 只要组件上存在一个 isBindNode 属性为 false 则不会描扫节点此树绑定
 * @type {{onCheckNode: (function(*, *))}}
 */
const UIHelperPluginIsBindNode = {
    name: 'UIHelperPluginIsBindNode',
    onCheckNode(node, target) {
        const placeHolder = _.find(node._components, (component) => {
            return component.isBindNode === false;
        });

        //占位组件找到了返回 false,
        return placeHolder ? false : true;
    }
};


/**
 * 精灵帧替换插件
 * @type {{onCheckNode: (function(*, *))}}
 */
const UIHelperPluginSpriteFrameReplace = {
    name: 'UIHelperPluginSpriteFrameReplace',
    onCheckNode(node, target) {
        //在此可替换 sprite 的纹理

        const sprite = node.getComponent(cc.Sprite);
        if (sprite && node.name.indexOf('replace') !== -1) {
            cc.log('>>>>>>' + sprite.getTextureFilename());
            cc.loader.loadRes('common/texture/ui/btn01.png', (error, texture) => {
                sprite.spriteFrame = new cc.SpriteFrame(texture);
            });
        }
    }
};

/**
 * 成员检查插件,
 * @type UIHelperPluginMemberCheck
 */
const UIHelperPluginMemberCheck = {
    name: 'UIHelperPluginMemberCheck',
    onBindStart() {

    },

    onBindEnd(node, target) {
        if (!target.getViewMembers) {
            return;
        }
        this.onCheckViewMember(target);
    },

    /**
     * 检查target对象上,节点是否存在
     * @param target
     */
    onCheckViewMember(target) {
        const name = target.constructor ? target.constructor.NAME : '未知对象';
        const members = target.getViewMembers();
        members.forEach((key) => {
            if (!target[key]) {
                cc.warn(`[name]: UI节点${key}不存在`);
            }
        });
    },
};

/**
 * label控件string属性支持表达示字符串: {{ exp }}
 *
 */
const UIHelperPluginLabelString = {
    name: 'UIHelperPluginLabelString',
    onCheckNode(node, target) {
        let label = node.getComponent(cc.Label);
        if (!label) {
            return;
        }

        let str = label.string;
        if (!_.isString(str) || str.length < 5) {
            return;
        }


        let exp;
        if (str.startsWith('{{')) {
            exp = this.componentExp(target, str);
        } else if (str.startsWith('{')) {
            exp = this.mediatorExp(target, str);
        }

        if (!exp) {
            return;
        }

        label.$exp = this.createFunc(target, label, exp);
        label.$exp();
    },

    createFunc(target, label, exp) {
        let func = new Function('$', 'self', `return ${exp}`);
        return function () {
            try {
                label.string = func(target, label);
            } catch (e) {
                cc.log(`表达示错误${exp}`);
                cc.log(e.stack);
            }
        };
    },

    componentExp(target, str) {
        if (target instanceof cc.Component) {
            return str.match(/^{{+(.*)}}+$/)[1];
        }
        return '';
    },

    mediatorExp(target, str) {
        if (!(target instanceof cc.Component)) {
            return str.match(/^{(.*)}$/)[1];
        }
        return '';
    },
};

/**
 * 设置默认字体: Label
 * @type {{onCheckNode: (function(*, *))}}
 */
const UIHelperPluginLabelDefaultFont = {
    name: 'UIHelperPluginLabelDefaultFont',

    _defaultFont: null,
    getFont() {
        if (!this._defaultFont) {
            this._defaultFont = cc.loader.getRes('core/textures/un_UN/font/simhei', cc.TTFFont);
        }
        return this._defaultFont;
    },

    onCheckNode(node, target) {
        let component = node.getComponent(cc.Label);
        if (!component) {
            return;
        }

        if (!component.font) {
            component.font = this.getFont();
        }
    }
};


module.exports = [
    UIHelperPluginIsBindNode,
    UIHelperPluginSpriteFrameReplace,
    UIHelperPluginMemberCheck,
    UIHelperPluginLabelString,
    UIHelperPluginLabelDefaultFont,
];