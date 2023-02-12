import { readFile } from "fs/promises";
import { fileURLToPath } from "url";

const externals = [
    "@arcgis/core/",
    "esri/",
    "@vertigis/",
    "react",
    "react-dom",
    "web",
];

function isExternal(id) {
    for (const ext of externals) {
        if (ext.endsWith("/")) {
            if (id.startsWith(ext)) {
                return true;
            }
        } else {
            if (id === ext) {
                return true;
            }
        }
    }
}

function plugins() {
    return [
        {
            name: "vite-web-sdk-dev-resolver",
            enforce: "pre",
            apply: "serve",
    
            resolveId(id, importer) {
                if (isExternal(id)) {
                    return id;
                }

                if (id === "/start.mjs") {
                    return id;
                }
            },

            async load(id) {
                if (id === "/start.mjs") {
                    const path = fileURLToPath(new URL("start.mjs", import.meta.url));
                    return await readFile(path, "utf-8");
                }
            }
        },

        {
            name: "vite-web-sdk-build",
            enforce: "pre",
            apply: "build",

            config(config) {
                config.publicDir = "app";

                const build = config.build || {};
                config.build = build;

                const rollupOptions = build.rollupOptions || {};
                build.rollupOptions = rollupOptions;

                rollupOptions.input = "src/index.ts";
                rollupOptions.output = {
                    format: "amd",
                    dir: "dist",
                    entryFileNames: "main.js",
                    chunkFileNames: "main-[hash].js",
                    assetFileNames: "main-[hash].[ext]",    
                };
            },
    
            resolveId(id, importer) {
                if (isExternal(id)) {
                    return { id, external: true };
                }
            },
        },

        {
            name: "vite-web-sdk-dev-transform",
            enforce: "post",
            apply: "serve",

            transform(code, id) {
                function recurse(node) {
                    if (Array.isArray(node)) {
                        for (const part of node) {
                            recurse(part);
                        }
    
                        return;
                    }
                    
                    if (node && typeof node === "object") {
                        const { type } = node;
                        if (type === "ImportDeclaration") {
                            const { specifiers, source } = node;
                            const { value } = source;
                            if (isExternal(value)) {
                                take(node);
    
                                if (specifiers.length) {
                                    push("const ");
    
                                    let first = true;
                                    for (const { type, local, imported } of specifiers) {
                                        if (type !== "ImportNamespaceSpecifier") {
                                            if (first) {
                                                first = false;
                                                push("{ ");
                                            } else {
                                                push(", ");
                                            }
    
                                            if (type === "ImportDefaultSpecifier") {
                                                push("default: ");
                                            } else if (imported && imported.name !== local.name) {
                                                push(imported.name);
                                                push(": ");
                                            }
                                        }
    
                                        push(local.name);
                                    }
    
                                    if (!first) {
                                        push(" }");
                                    }
    
                                    push(" = ");
                                }
                                
                                push("await __import(");
                                push(JSON.stringify(value));
                                push(");");
    
                                return;
                            }
                        }
    
                        if (type === "ImportExpression") {
                            const { type, value } = node.source;
                            if (type === "Literal" && isExternal(value)) {
                                take(node);   
                                push("__import(");
                                push(JSON.stringify(value));
                                push(")");
    
                                return;
                            }
                        }
    
                        for (const key in node) {
                            recurse(node[key]);
                        }
    
                        return;
                    }                        
                }
    
                function push(value) {
                    fragments.push(value);
                }
    
                function take(node) {
                    const { start, end } = node;
                    fragments.push(code.substring(last, start));
                    last = end;
                }
    
                let last = 0;
                const fragments = [];
                const root = this.parse(code);
                recurse(root);
    
                if (fragments.length) {
                    fragments.push(code.substring(last, code.length));
    
                    const result = fragments.join("");               
                    return result;
                }
    
                return { ast: root };
            }
        },

        {
            name: "vite-web-sdk-dev-server",
            apply: "serve",
    
            config(config) {
                config.publicDir = "app";
    
                const server = config.server || {};
                config.server = server;
                
                const proxy = server.proxy || {};
                server.proxy = {
                    ...proxy,
    
                    "/viewer/": {
                        target: "https://apps.vertigisstudio.com/web/",
                        changeOrigin: true,
                        rewrite: x => x.replace(/\/.*?\//, "/"),
                    },
        
                    "/scripts/": {
                        target: "https://apps.vertigisstudio.com/web/",
                        changeOrigin: true,
                    },
        
                    "/static/": {
                        target: "https://apps.vertigisstudio.com/web/",
                        changeOrigin: true,
                    }
                };
            },

            configureServer(server) {
                server.middlewares.use(async (req, res, next) => {
                    const url = (req.url || "").replace(/[?#].*/, "");
                    if (req.method === "GET" && url === "/") {
                        const path = fileURLToPath(new URL("index.html", import.meta.url));
                        const html = await readFile(path, "utf-8");
                        const content = await server.transformIndexHtml(url, html);
                        res.statusCode = 200;-
                        res.setHeader("cache-control", "no-cache");
                        res.setHeader("content-type", "text/html; charset=utf-8");
                        res.write(content);
                        res.end();
                    } else {
                        next();
                    }
                });                
            }
        }
    ];
}

export default plugins;
