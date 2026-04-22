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
const array_1 = require("./utils/array");
const ZERO = new decimal_1.Decimal(0);
const minDecimal = (a, b) => (a.lt(b) ? a : b);
class Orderbook {
    constructor(options) {
        this.asks = []; // 오름차순 - sell - ASK
        this.bids = []; // 내림차순 - buy  - BID
        this.orderIdMap = {};
        // which tree to use?
        this.quantityByPriceWithAsks = {};
        this.quantityByPriceWithBids = {};
        this.limit = (options === null || options === void 0 ? void 0 : options.limit) || 15;
    }
    getOrderbook() {
        return {
            asks: this.getAsks(),
            bids: this.getBids(),
        };
    }
    getAsks() {
        return (0, array_1.mapSort)(this.limit, this.quantityByPriceWithAsks, 1);
    }
    getBids() {
        return (0, array_1.mapSort)(this.limit, this.quantityByPriceWithBids, -1);
    }
    cancel(orderId) {
        const order = this.orderIdMap[orderId];
        if (!order) {
            throw new Error(`NOT FOUND ORDERID: ${orderId}`);
        }
        const price = order.price.toString();
        if (order.side === trade_1.TRADE_SIDE.BID) {
            const index = this.bids.findIndex(bid => bid.orderId === orderId);
            if (index < 0)
                throw new Error(`NOT FOUND ORDERID: ${orderId}`);
            this.bids = this.bids.slice(0, index).concat(this.bids.slice(index + 1, this.bids.length));
            this.quantityByPriceWithBids[price] = this.quantityByPriceWithBids[price].sub(order.leaveQuantity);
            if (this.quantityByPriceWithBids[price].eq(ZERO)) {
                delete this.quantityByPriceWithBids[price];
            }
        }
        else {
            const index = this.asks.findIndex(ask => ask.orderId === orderId);
            if (index < 0)
                throw new Error(`NOT FOUND ORDERID: ${orderId}`);
            this.asks = this.asks.slice(0, index).concat(this.asks.slice(index + 1, this.asks.length));
            this.quantityByPriceWithAsks[price] = this.quantityByPriceWithAsks[price].sub(order.leaveQuantity);
            if (this.quantityByPriceWithAsks[price].eq(ZERO)) {
                delete this.quantityByPriceWithAsks[price];
            }
        }
        delete this.orderIdMap[orderId];
        return order;
    }
    add(orderId, side, price, quantity) {
        var _a, _b;
        var _c, _d;
        if (this.orderIdMap[orderId]) {
            throw new Error(`DUPLICATE ORDERID: ${orderId}`);
        }
        const order = new order_1.default(orderId, side, price, quantity);
        if (!order.price.gt(ZERO)) {
            throw new Error('price must be greater than 0');
        }
        if (!order.quantity.gt(ZERO)) {
            throw new Error('quantity must be greater than 0');
        }
        const priceKey = order.price.toString();
        const trades = [];
        if (side === trade_1.TRADE_SIDE.BID) { // 구매주문
            let bestOrder = this.asks.length ? this.asks[0] : null;
            while ((bestOrder === null || bestOrder === void 0 ? void 0 : bestOrder.price.lte(order.price)) && order.leaveQuantity.gt(ZERO)) {
                const matchQuantity = minDecimal(bestOrder.leaveQuantity, order.leaveQuantity);
                order.leaveQuantity = order.leaveQuantity.sub(matchQuantity);
                bestOrder.leaveQuantity = bestOrder.leaveQuantity.sub(matchQuantity);
                trades.push(new trade_1.default(orderId, bestOrder.price, matchQuantity, side));
                if (bestOrder.leaveQuantity.eq(ZERO)) {
                    this.asks.shift();
                    delete this.orderIdMap[bestOrder.orderId];
                    bestOrder = this.asks.length ? this.asks[0] : null;
                }
            }
            if (order.leaveQuantity.gt(ZERO)) {
                this.bids.push(order);
                this.bids.sort((a, b) => {
                    if (a.price.gt(b.price))
                        return -1;
                    if (a.price.lt(b.price))
                        return 1;
                    return 0;
                });
                (_a = (_c = this.quantityByPriceWithBids)[priceKey]) !== null && _a !== void 0 ? _a : (_c[priceKey] = new decimal_1.Decimal(0));
                this.quantityByPriceWithBids[priceKey] = this.quantityByPriceWithBids[priceKey].add(order.leaveQuantity);
            }
            for (const trade of trades) {
                const tradePrice = trade.tradePrice.toString();
                this.quantityByPriceWithAsks[tradePrice] = this.quantityByPriceWithAsks[tradePrice].sub(trade.tradeQuantity);
                if (this.quantityByPriceWithAsks[tradePrice].eq(ZERO)) {
                    delete this.quantityByPriceWithAsks[tradePrice];
                }
            }
        }
        else { // 판매주문
            let bestOrder = this.bids.length ? this.bids[0] : null;
            while ((bestOrder === null || bestOrder === void 0 ? void 0 : bestOrder.price.gte(order.price)) && order.leaveQuantity.gt(ZERO)) {
                const matchQuantity = minDecimal(bestOrder.leaveQuantity, order.leaveQuantity);
                order.leaveQuantity = order.leaveQuantity.sub(matchQuantity);
                bestOrder.leaveQuantity = bestOrder.leaveQuantity.sub(matchQuantity);
                trades.push(new trade_1.default(orderId, bestOrder.price, matchQuantity, side));
                if (bestOrder.leaveQuantity.eq(ZERO)) {
                    this.bids.shift();
                    delete this.orderIdMap[bestOrder.orderId];
                    bestOrder = this.bids.length ? this.bids[0] : null;
                }
            }
            if (order.leaveQuantity.gt(ZERO)) {
                this.asks.push(order);
                this.asks.sort((a, b) => {
                    if (a.price.gt(b.price))
                        return 1;
                    if (a.price.lt(b.price))
                        return -1;
                    return 0;
                });
                (_b = (_d = this.quantityByPriceWithAsks)[priceKey]) !== null && _b !== void 0 ? _b : (_d[priceKey] = new decimal_1.Decimal(0));
                this.quantityByPriceWithAsks[priceKey] = this.quantityByPriceWithAsks[priceKey].add(order.leaveQuantity);
            }
            for (const trade of trades) {
                const tradePrice = trade.tradePrice.toString();
                this.quantityByPriceWithBids[tradePrice] = this.quantityByPriceWithBids[tradePrice].sub(trade.tradeQuantity);
                if (this.quantityByPriceWithBids[tradePrice].eq(ZERO)) {
                    delete this.quantityByPriceWithBids[tradePrice];
                }
            }
        }
        if (order.leaveQuantity.gt(ZERO)) {
            this.orderIdMap[order.orderId] = order;
        }
        return {
            order, trades
        };
    }
}
exports.default = Orderbook;
