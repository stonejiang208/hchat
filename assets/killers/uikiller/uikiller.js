/**
 * Created by zxh on 2017/3/8.
 */
const _ = require('lodash');
const UIKillerPlugins = require('./uikiller-plugin');

const DEFAULT_EVENT_NAMES = [
    '_onTouchStart',
    '_onTouchMove',
    '_onTouchEnd',
    '_onTouchCancel',
];

const UIKiller = {
    _prefix: '_',
    _plugins: [],

    registerPlugin(plugins) {
        if (!_.isArray(plugins)) {
            plugins = [plugins];
        }

        plugins.forEach((plugin) => {
            let findPlugin = _.find(this._plugins, (item) => {
                return item.name === plugin.name;
            });

            if (findPlugin) {
                return;
            }

            this._plugins.push(plugin);
            if (plugin.onRegister) {
                plugin.onRegister();
            }
        });
    },

    _getComponentName(component) {
        return component.name.match(/<.*>$/)[0].slice(1, -1);
    },

    bindComponent(component, isBindRootEvent) {
        let root = component.node;
        root._components.forEach((nodeComponent) => {
            let name = this._getComponentName(nodeComponent);
            name = `$${name}`;
            root[name] = nodeComponent;
        });

        if (isBindRootEvent) {
            this._bindTouchEvent(root, component, DEFAULT_EVENT_NAMES);
        }

        this._bindNode(component.node, component);
    },

    /**
     * 编写子节点到 target 对象
     * @param node
     * @param target
     */
    bindNode(node, target) {
        if (target.$collector) {
            if (target.$collector.node === node) {
                return;
            }
            delete target.$collector.node;
        }

        _.forEach(target.$collector, (obj, key) => {
            delete target[key];
        });

        target.$collector = { node };
        node._components.forEach((component) => {
            let name = this._getComponentName(component);
            name = `$${name}`;
            target[name] = component;
            target.$collector[name] = component;
        });

        this._bindStartByPlugins(node, target);
        this._bindNode(node, target);
        this._bindEndByPlugins(node, target);
    },

    _bindStartByPlugins(node, target) {
        this._plugins.forEach((plugin) => {
            if (plugin.onBindStart) {
                plugin.onBindStart(node, target);
            }
        });
    },

    _bindEndByPlugins(node, target) {
        this._plugins.forEach((plugin) => {
            if (plugin.onBindEnd) {
                plugin.onBindEnd(node, target);
            }
        });
    },

    _bindNode(nodeObject, target) {
        const node = nodeObject;

        //绑定组件到自身node节点上
        if (node.name[0] === this._prefix) {
            node._components.forEach((component) => {
                let name = this._getComponentName(component);
                name = `$${name}`;
                if (this[name]) {
                    cc.warn(`${name} property is already exists`);
                    return;
                }

                node[name] = component;
                //检查组件 onBind 函数,通知组件,target 对象在绑定自己
                if (_.isFunction(component.onBind)) {
                    component.onBind(target);
                }
            });
        }

        //执行插件
        let bool = this._checkNodeByPlugins(node, target);
        if (!bool) {
            return;
        }
        
        node.children.forEach((child) => {
            let name = child.name;
            if (name[0] === this._prefix) {
                let index = name.indexOf('$');

                //检查控件别名
                if (index !== -1) {
                    child.$eventName = name.substr(0, index);
                    child.$ = name.substr(index + 1);
                    name = child.$eventName + child.$[0].toUpperCase() + child.$.substr(1);
                    child.name = name;
                }

                if (target[name]) {
                    cc.warn(`${target.name}.${name} property is already exists`);
                    return;
                }
                this._bindTouchEvent(child, target);

                target[name] = child;

                //保存绑定的指针
                if (target.$collector) {
                    target.$collector[name] = child;
                }
            } else {
                //绑定非前缀子节点
                if (node[name]) {
                    cc.warn(`${node.name}.${name} property is already exists`);
                } else {
                    node[name] = child;
                }
            }
                
            this._bindNode(child, target);
        });
    },

    _getTouchEventName(node, event) {
        let name = node.$eventName || node.name;
        if (name) {
            name = name[this._prefix.length].toUpperCase() + name.slice(this._prefix.length + 1);
        }

        if (event) {
            return `_on${name}${event}`;
        }

        return [
            `_on${name}TouchStart`,
            `_on${name}TouchMove`,
            `_on${name}TouchEnd`,
            `_on${name}TouchCancel`,
        ];
    },

    /**
     * 绑定事件
     * @param {cc.Node} node
     */
    _bindTouchEvent(node, target, defaultNames) {
        //todo: EditBox 组件不能注册触摸事件,在原生上会导致不能被输入
        if (node.getComponent(cc.EditBox)) {
            return;
        }

        const eventNames = defaultNames || this._getTouchEventName(node);
        const eventTypes = [
            cc.Node.EventType.TOUCH_START,
            cc.Node.EventType.TOUCH_MOVE,
            cc.Node.EventType.TOUCH_END,
            cc.Node.EventType.TOUCH_CANCEL,
        ];

        eventNames.forEach((eventName, index) => {
            const tempEvent = target[eventName];
            if (!tempEvent && !node.getComponent(cc.Button)) {
                return;
            }

            node.on(eventTypes[index], (event) => {
                //被禁用的node 节点不响应事件
                let eventNode = event.target;
                if (eventNode.interactable === false || eventNode.active === false) {
                    return;
                }
                
                const eventFunc = target[eventName];
                let eventResult;
                this._beforeHandleEventByPlugins(eventNode, event, !!eventFunc);

                if (eventFunc) {
                    eventResult = eventFunc.call(target, eventNode, event);
                    event.stopPropagation();
                }

                this._afterHandleEventByPlugins(eventNode, event, !!eventFunc, eventResult);
            });
        });

        this._bindTouchLongEvent(node, target);
    },

    /**
     * 绑定长按事件
     * @param {cc.Node} node
     */
    _bindTouchLongEvent(nodeObject, target) {
        const node = nodeObject;
        const eventName = this._getTouchEventName(node, 'TouchLong');
        const touchLong = target[eventName];
        if (!_.isFunction(touchLong)) {
            return;
        }

        node._touchLongTimer = null;
        node.on(cc.Node.EventType.TOUCH_END, () => {
            if (node._touchLongTimer) {
                clearTimeout(node._touchLongTimer);
                node._touchLongTimer = null;
            }
        });

        node.on(cc.Node.EventType.TOUCH_START, (event) => {
            node._touchLongTimer = setTimeout(() => {
                touchLong.call(target, node, event);
                node._touchLongTimer = null;
            }, 1000);
        });
    },


    /**
     * 拿所有插件去检查node 节点, onCheckNode返回为 false 的,此节点将不被绑定
     * @param node
     * @param target
     * @returns {boolean}
     * @private
     */
    _checkNodeByPlugins(node, target) {
        const plugin = _.find(this._plugins, (item) => {
            if (item.onCheckNode) {
                return item.onCheckNode(node, target) === false;
            }
            return null;
        });

        return !plugin;
    },

    /**
     * 插件响应节点触摸前事件
     * @param node
     * @param event
     * @private
     */
    _beforeHandleEventByPlugins(node, event, hasEventFunc) {
        _.forEach(this._plugins, (item) => {
            if (item.onBeforeHandleEvent) {
                item.onBeforeHandleEvent(node, event, eventFunc);
            }
        });
    },

    /**
     * 插件响应节点触摸后事件
     * @param node
     * @param event
     * @private
     */
    _afterHandleEventByPlugins(node, event, hasEventFunc, eventResult) {
        _.forEach(this._plugins, (item) => {
            if (item.onAfterHandleEvent) {
                item.onAfterHandleEvent(node, event, hasEventFunc, eventResult);
            }
        });
    },
};

//注册插件
UIKiller.registerPlugin(UIKillerPlugins);
module.exports = UIKiller;