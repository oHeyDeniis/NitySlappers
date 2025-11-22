import { Plugin, PluginEvents } from '@serenityjs/plugins';

declare class NitySlappers extends Plugin implements PluginEvents {
    constructor();
    onInitialize(): void;
}
declare const _default: NitySlappers;

export { _default as default };
