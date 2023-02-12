let reload = false;

function getAbsoluteUrl(value) {
    const url = new URL(value, location.href);
    return url.toString();
}

async function getAppConfig() {
    const res = await fetch(getAbsoluteUrl("app.json"));
    return await res.json();
}

function fauxRegistry(registry, wrap, hot) {
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

async function hoistViewer() {
    const res = await fetch("viewer/index.html");
    const parser = new DOMParser();
    const html = parser.parseFromString(await res.text(), "text/html");
    for (const node of [...html.head.children]) {
        if (node.tagName === "SCRIPT") {
            const script = document.createElement("script");
            const src = node.getAttribute("src");
            src && script.setAttribute("src", src);
            script.innerHTML = node.innerHTML;
            document.head.append(script);

            if (src) {
                await new Promise(x => script.addEventListener("load", x));
            }
        }

        if (node.tagName === "STYLE") {
            document.head.append(document.adoptNode(node));
        }
    }

    window.__import = (name) => {
        return new Promise((resolve, reject) => {
            const hoist = value => {
                if (!value.__esModule) {
                    const result = Object.create(value);
                    result.__esModule = true;

                    if (!("default" in value)) {
                        result.default = value;
                    }
                    
                    value = result;
                }

                resolve(value);
            };

            require([name], hoist, reject);
        });        
    };    
}

async function start() {
    await hoistViewer();

    class Wrapper extends Set {
        constructor() {
            super();
            this.front = this.front.bind(this)
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
            wrapper = new Wrapper(visual);
            wrappers.set(key, wrapper);
            Object.defineProperty(wrapper.front, "name", { enumerable: false, value: name, writable: false });
        }
    
        wrapper.update(visual);
        return wrapper.front;
    }

    const wrappers = new Map();
    const appConfig = await getAppConfig();
    const startup = await Promise.all([
        import("web"),
        import("@vertigis/web-libraries!/common"),
        import("@vertigis/web-libraries!/web"),
    ]);

    const webViewer = startup.shift();
    const { createElement, useEffect, useState } = await import("react");
    const { default: init } = await import("/src/index.ts");
    return new Promise(resolve => {
        const libs = startup.map(lib => lib.default);
        libs.push(registry => {
            init(fauxRegistry(registry, wrap, false), false);

            let sync = {};
            const faux = fauxRegistry(registry, wrap, true);
            resolve(promise => {
                const cookie = sync = {};
                promise.then(({ default: init }) => {
                    if (sync === cookie) {
                        reload = true;
                        init(faux, true);

                        if (reload) {
                            location.reload();
                        }
                    }
                });
            });
        });

        webViewer.bootstrap({
            appConfig,
            layout: getAbsoluteUrl("layout.xml"),
            libraries: libs,
        });
    });
}

if (import.meta.hot) {
    import.meta.hot.accept();

    if (import.meta.hot.data.promise) {
        import.meta.hot.data.promise.then(x => x(import("/src/index.ts")));
    } else {
        import.meta.hot.data.promise = start();    
    }
} else {
    hoistViewer();
}