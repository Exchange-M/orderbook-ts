"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Engine {
    constructor(options) {
        this.orderbook = options.orderbook;
        this.dataSourceHook = options === null || options === void 0 ? void 0 : options.dataSourceHook;
    }
    getOrderbook() {
        return this.orderbook.getOrderbook();
    }
    cancel(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (this.dataSourceHook) {
                const proceed = yield this.dataSourceHook.beforeCancelHook(orderId);
                if (proceed === false) {
                    throw new Error(`CANCEL REJECTED BY HOOK: ${orderId}`);
                }
            }
            const order = this.orderbook.cancel(orderId);
            yield ((_a = this.dataSourceHook) === null || _a === void 0 ? void 0 : _a.afterCancelHook(order));
            return order;
        });
    }
    add(orderId, side, price, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (this.dataSourceHook) {
                const proceed = yield this.dataSourceHook.beforeAddHook(orderId, side, price, quantity);
                if (proceed === false) {
                    throw new Error(`ADD REJECTED BY HOOK: ${orderId}`);
                }
            }
            const { order, trades } = this.orderbook.add(orderId, side, price, quantity);
            yield ((_a = this.dataSourceHook) === null || _a === void 0 ? void 0 : _a.afterAddHook(order, trades));
            return { order, trades };
        });
    }
}
exports.default = Engine;
