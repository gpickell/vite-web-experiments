function getAbsoluteUrl(value) {
    const url = new URL(value, location.href);
    return url.toString();
}

async function getAppConfig() {
    const res = await fetch(getAbsoluteUrl("app.json"));
    return await res.json();
}

async function hoistViewer() {
    const scripts = [];
    const res = await fetch("viewer/index.html");
    const parser = new DOMParser();
    const html = parser.parseFromString(await res.text(), "text/html");
    for (const node of [...html.head.children]) {
        if (node.tagName === "SCRIPT") {
            const script = document.createElement("script");
            const src = node.getAttribute("src");
            if (src) {
                const load = async () => {
                    const res = await fetch(src);
                    script.textContent = await res.text();
                    return script;
                };

                scripts.push(load());
            } else {
                script.textContent = node.textContent;
                scripts.push(script);
            }
        }

        if (node.tagName === "STYLE") {
            scripts.push(document.adoptNode(node));
        }
    }

    for (const script of scripts) {
        document.head.append(await script);
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

    const startup = await Promise.all([
        getAppConfig(),
        import("web"),
        import("@vertigis/web-libraries!/common"),
        import("@vertigis/web-libraries!/web"),
    ]);

    const modules = await Promise.all([
        import("/src/index.ts"),
        import("/@sdk/hmr"),
    ]);

    const appConfig = startup.shift();
    const webViewer = startup.shift();
    const { default: init } = modules.shift();
    const { fauxRegistry, shouldReload } = modules.shift();
    return new Promise(resolve => {
        const libs = startup.map(lib => lib.default);
        libs.push(registry => {
            init(fauxRegistry(registry, false), false);

            let sync = {};
            const faux = fauxRegistry(registry, true);
            resolve(promise => {
                const cookie = sync = {};
                promise.then(({ default: init }) => {
                    if (sync === cookie) {
                        shouldReload();
                        init(faux, true);

                        if (shouldReload()) {
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
    start();
}