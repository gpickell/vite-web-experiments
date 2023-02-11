import { createElement, useEffect, useState } from "react";

class Wrapper extends Set {
    constructor() {
        super();
        this.front = this.front.bind(this)
    }

    front(props) {
        const [visual, set] = useState(() => this.visual);
        useEffect(() => this.watch(set), []);

        return createElement(visual, props);
    }

    update(visual) {
        this.visual = visual;
        this.forEach(x => x(() => this.visual));
    }

    watch(set) {
        this.add(set);
        set(() => this.visual);

        return () => this.delete(set);
    }
}

const registry = new WeakMap();
const wrappers = new Map();

function hot(ctx) {
    if (typeof ctx === "object") {
        let invalidate = true;
        for (const key in ctx) {
            let wrapper = wrappers.get(key);
            if (wrapper === undefined) {
                wrappers.set(key, wrapper = new Wrapper());
                Object.defineProperty(wrapper.front, "name", { value: key });
            }

            const visual = ctx[key];
            if (registry.get(visual) !== wrapper.front) {
                invalidate = false;

                registry.set(visual, wrapper.front);
                wrapper.update(visual);
            }
        }

        if (invalidate && wrappers.size) {
            location.reload();
        }
    }

    if (typeof ctx === "function") {
        return registry.get(ctx) || ctx;
    }
}

export default hot;