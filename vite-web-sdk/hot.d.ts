declare global {
    interface ImportMeta {
        readonly hot?: ViteHotContext
    }
      
    interface ViteHotContext {
        [Symbol.toStringTag]: "ViteHotContext";
        accept(): void;
    }
}

declare function hot(visuals: Record<string, React.FC<any>>): void;
declare function hot<T extends React.FC<any>>(ctx: T): T;

export default plugins;
