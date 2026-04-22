"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypedEventEmitter = void 0;
class TypedEventEmitter {
    constructor() {
        this.listeners = {};
    }
    on(event, listener) {
        var _a;
        var _b;
        ((_a = (_b = this.listeners)[event]) !== null && _a !== void 0 ? _a : (_b[event] = [])).push(listener);
        return this;
    }
    off(event, listener) {
        const arr = this.listeners[event];
        if (!arr)
            return this;
        const i = arr.indexOf(listener);
        if (i >= 0)
            arr.splice(i, 1);
        return this;
    }
    once(event, listener) {
        const wrapper = ((...args) => {
            this.off(event, wrapper);
            listener(...args);
        });
        return this.on(event, wrapper);
    }
    emit(event, ...args) {
        const arr = this.listeners[event];
        if (!arr)
            return;
        for (const fn of arr.slice()) {
            fn(...args);
        }
    }
    removeAllListeners(event) {
        if (event)
            delete this.listeners[event];
        else
            this.listeners = {};
        return this;
    }
}
exports.TypedEventEmitter = TypedEventEmitter;
