"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const decimal_1 = require("@aficion360/decimal");
const trade_1 = __importStar(require("./trade"));
const order_1 = __importDefault(require("./order"));
const price_level_1 = require("./price-level");
const ZERO = new decimal_1.Decimal(0);
const minDecimal = (a, b) => (a.lt(b) ? a : b);
// Binary-search insert preserving order. ascending=true for asks, false for bids.
const insertSorted = (arr, level, ascending) => {
    let lo = 0;
    let hi = arr.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        const goRight = ascending
            ? arr[mid].price.lt(level.price)
            : arr[mid].price.gt(level.price);
        if (goRight)
            lo = mid + 1;
        else
            hi = mid;
    }
    arr.splice(lo, 0, level);
};
const findSortedIndex = (arr, price, ascending) => {
    let lo = 0;
    let hi = arr.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (arr[mid].price.eq(price))
            return mid;
        const goRight = ascending
            ? arr[mid].price.lt(price)
            : arr[mid].price.gt(price);
        if (goRight)
            lo = mid + 1;
        else
            hi = mid;
    }
    return -1;
};
class Orderbook {
    constructor(options) {
        // best at index 0
        this.askLevels = new Map();
        this.askSorted = []; // ascending
        this.bidLevels = new Map();
        this.bidSorted = []; // descending
        this.orderIdMap = new Map();
        this.limit = (options === null || options === void 0 ? void 0 : options.limit) || 15;
    }
    getOrderbook() {
        return {
            asks: this.getAsks(),
            bids: this.getBids(),
        };
    }
    getAsks() {
        return this.snapshot(this.askSorted);
    }
    getBids() {
        return this.snapshot(this.bidSorted);
    }
    snapshot(sorted) {
        const out = [];
        const n = Math.min(this.limit, sorted.length);
        for (let i = 0; i < n; i++) {
            out.push({
                price: sorted[i].priceKey,
                quantity: sorted[i].totalQuantity.toString(),
            });
        }
        return out;
    }
    cancel(orderId) {
        const node = this.orderIdMap.get(orderId);
        if (!node) {
            throw new Error(`NOT FOUND ORDERID: ${orderId}`);
        }
        const level = node.level;
        const order = node.order;
        level.removeNode(node);
        this.orderIdMap.delete(orderId);
        if (level.isEmpty()) {
            this.removeLevel(order.side, level);
        }
        return order;
    }
    add(orderId, side, price, quantity) {
        if (this.orderIdMap.has(orderId)) {
            throw new Error(`DUPLICATE ORDERID: ${orderId}`);
        }
        const order = new order_1.default(orderId, side, price, quantity);
        if (!order.price.gt(ZERO)) {
            throw new Error('price must be greater than 0');
        }
        if (!order.quantity.gt(ZERO)) {
            throw new Error('quantity must be greater than 0');
        }
        const trades = [];
        const oppositeSide = side === trade_1.TRADE_SIDE.BID ? trade_1.TRADE_SIDE.ASK : trade_1.TRADE_SIDE.BID;
        const oppositeSorted = side === trade_1.TRADE_SIDE.BID ? this.askSorted : this.bidSorted;
        while (oppositeSorted.length > 0 && order.leaveQuantity.gt(ZERO)) {
            const bestLevel = oppositeSorted[0];
            const crosses = side === trade_1.TRADE_SIDE.BID
                ? bestLevel.price.lte(order.price)
                : bestLevel.price.gte(order.price);
            if (!crosses)
                break;
            while (bestLevel.head && order.leaveQuantity.gt(ZERO)) {
                const headOrder = bestLevel.head.order;
                const matchQty = minDecimal(headOrder.leaveQuantity, order.leaveQuantity);
                order.leaveQuantity = order.leaveQuantity.sub(matchQty);
                const { order: matched, fullyFilled } = bestLevel.consumeHead(matchQty);
                trades.push(new trade_1.default(orderId, bestLevel.price, matchQty, side));
                if (fullyFilled) {
                    this.orderIdMap.delete(matched.orderId);
                }
            }
            if (bestLevel.isEmpty()) {
                oppositeSorted.shift();
                (oppositeSide === trade_1.TRADE_SIDE.BID ? this.bidLevels : this.askLevels).delete(bestLevel.priceKey);
            }
        }
        if (order.leaveQuantity.gt(ZERO)) {
            const level = this.getOrCreateLevel(side, order.price);
            const node = level.push(order);
            this.orderIdMap.set(orderId, node);
        }
        return { order, trades };
    }
    getOrCreateLevel(side, price) {
        const map = side === trade_1.TRADE_SIDE.BID ? this.bidLevels : this.askLevels;
        const sorted = side === trade_1.TRADE_SIDE.BID ? this.bidSorted : this.askSorted;
        const ascending = side === trade_1.TRADE_SIDE.ASK;
        const key = price.toString();
        const existing = map.get(key);
        if (existing)
            return existing;
        const level = new price_level_1.PriceLevel(price);
        map.set(key, level);
        insertSorted(sorted, level, ascending);
        return level;
    }
    removeLevel(side, level) {
        const map = side === trade_1.TRADE_SIDE.BID ? this.bidLevels : this.askLevels;
        const sorted = side === trade_1.TRADE_SIDE.BID ? this.bidSorted : this.askSorted;
        const ascending = side === trade_1.TRADE_SIDE.ASK;
        map.delete(level.priceKey);
        const idx = findSortedIndex(sorted, level.price, ascending);
        if (idx >= 0)
            sorted.splice(idx, 1);
    }
}
exports.default = Orderbook;
