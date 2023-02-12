import { createElement, useEffect, useState } from "react";

let reload = false;
const wrappers = new Map();

class Wrapper extends Set {
    constructor(name) {
        super();
        this.front = this.front.bind(this)
        Object.defineProperty(this.front, "name", { enumerable: false, writable: false, value: name });
    }

    front(props) {
        const [visual, set] = useState(this.visual);
        useEffect(() => this.watch(set), []);

        return createElement(visual, props);
    }

    update(visual) {
        if (this.visual) {
            if (this.visual() !== visual()) {
                reload = false;

                this.visual = visual;
                this.forEach(x => x(this.visual));        
            }
        } else {
            this.visual = visual;
        }
    }

    watch(set) {
        this.add(set);
        set(this.visual);

        return () => this.delete(set);
    }
}

function wrap(key, visual, name) {
    if (typeof key !== "string") {
        key = JSON.stringify(key);
    }

    let wrapper = wrappers.get(key);
    if (!wrapper) {
        wrapper = new Wrapper(name);
        wrappers.set(key, wrapper);
    }

    wrapper.update(visual);
    return wrapper.front;
}

export function fauxRegistry(registry, hot) {
    return {
        hasCommand(name) {
            return registry.hasCommand(name);
        },

        hasComponent(ns, name) {
            return registry.hasComponent(ns, name);
        },

        hasIcon(iconId) {
            return registry.hasIcon(iconId);
        },

        hasModel(itemType) {
            return registry.hasModel(itemType);
        },

        hasOperation(name) {
            return registry.hasOperation(name);
        },

        hasService(name) {
            return registry.hasService(name);
        },

        registerCommand(command) {
            hot || registry.registerCommand(command);
        },

        registerComponent(manifest) {
            const { name, namespace } = manifest;
            const front = wrap([name, namespace], manifest.getComponentType, name);
            hot || registry.registerComponent({ ...manifest, getComponentType: () => front });
        },
        
        registerIcon(manifest) {
            hot || registry.registerIcon(manifest);
        },

        registerLanguageResources(manifest) {
            hot || registry.registerLanguageResources(manifest);
        },

        registerModel(manifest) {
            hot || registry.registerModel(manifest);
        },

        registerOperation(operation) {
            hot || registry.registerOperation(operation);
        },

        registerService(manifest) {
            hot || registry.registerService(manifest);
        },

        registerTool(manifest) {
            hot || registry.registerTool(manifest);
        },

        registerUpgrade(upgradeInfo) {
            hot || registry.registerUpgrade(upgradeInfo);
        },

        overrideComponent(manifest) {
            hot || registry.overrideComponent(manifest);
        },

        overrideModel(manifest) {
            hot || registry.overrideModel(manifest);
        },

        overrideService(manifest) {
            hot || registry.overrideService(manifest);
        },
    };
}

export function shouldReload() {
    const result = reload;
    reload = true;
    return result;
}
