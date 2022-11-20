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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const decimal_1 = require("@aficion360/decimal");
const trade_1 = __importStar(require("./trade"));
const order_1 = __importDefault(require("./order"));
const array_1 = require("./utils/array");
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
        var _a, _b;
        const order = this.orderIdMap[orderId];
        const price = order.price.getValue().toString();
        if ((order === null || order === void 0 ? void 0 : order.side) === trade_1.TRADE_SIDE.BID) {
            const index = this.bids.findIndex(bid => bid.orderId === orderId);
            if (index < 0)
                throw new Error(`NOT FOUND ORDERID: ${orderId}`);
            this.bids = this.bids.slice(0, index).concat(this.bids.slice(index + 1, this.bids.length));
            this.quantityByPriceWithBids[price] = this.quantityByPriceWithBids[price].sub(order.leaveQuantity);
        }
        else {
            const index = this.asks.findIndex(ask => ask.orderId === orderId);
            if (index < 0)
                throw new Error(`NOT FOUND ORDERID: ${orderId}`);
            this.asks = this.asks.slice(0, index).concat(this.asks.slice(index + 1, this.asks.length));
            this.quantityByPriceWithAsks[price] = this.quantityByPriceWithAsks[price].sub(order.leaveQuantity);
        }
        if ((_a = this.quantityByPriceWithAsks[price]) === null || _a === void 0 ? void 0 : _a.eq(0)) {
            delete this.quantityByPriceWithAsks[price];
        }
        if ((_b = this.quantityByPriceWithBids[price]) === null || _b === void 0 ? void 0 : _b.eq(0)) {
            delete this.quantityByPriceWithBids[price];
        }
        delete this.orderIdMap[orderId];
        return order;
    }
    add(orderId, side, price, quantity) {
        var _a, _b;
        var _c, _d;
        if (price === 0 || quantity === 0) {
            throw new Error('price and quantity must great then "0"');
        }
        const order = new order_1.default(orderId, side, price, quantity);
        const trades = [];
        if (side === trade_1.TRADE_SIDE.BID) { // 구매주문
            let bestOrder = this.asks.length ? this.asks[0] : null;
            while ((bestOrder === null || bestOrder === void 0 ? void 0 : bestOrder.price.lte(order.price)) && order.leaveQuantity.gt(0)) {
                const matchQuantity = new decimal_1.Decimal(Math.min(bestOrder.leaveQuantity.getValue(), order.leaveQuantity.getValue()));
                order.leaveQuantity = order.leaveQuantity.sub(matchQuantity);
                bestOrder.leaveQuantity = bestOrder.leaveQuantity.sub(matchQuantity);
                trades.push(new trade_1.default(orderId, bestOrder.price, matchQuantity, side));
                if (bestOrder.leaveQuantity.eq(0)) {
                    this.asks.shift();
                    delete this.orderIdMap[bestOrder.orderId];
                    bestOrder = this.asks.length ? this.asks[0] : null;
                }
            }
            if (order.leaveQuantity.gt(0)) {
                this.bids.push(order);
                this.bids.sort((a, b) => b.price.sub(a.price).getValue()); // 내림차순 정렬
            }
            (_a = (_c = this.quantityByPriceWithBids)[price]) !== null && _a !== void 0 ? _a : (_c[price] = new decimal_1.Decimal(0));
            this.quantityByPriceWithBids[price] = this.quantityByPriceWithBids[price].add(order.leaveQuantity);
            if (this.quantityByPriceWithBids[price].eq(0))
                delete this.quantityByPriceWithBids[price];
            for (const trade of trades) {
                const tradePrice = trade.tradePrice.getValue().toString();
                this.quantityByPriceWithAsks[tradePrice] = this.quantityByPriceWithAsks[tradePrice].sub(trade.tradeQuantity);
                if (this.quantityByPriceWithAsks[tradePrice].eq(0)) {
                    delete this.quantityByPriceWithAsks[tradePrice];
                }
            }
        }
        else { // 판매주문
            let bestOrder = this.bids.length ? this.bids[0] : null;
            while ((bestOrder === null || bestOrder === void 0 ? void 0 : bestOrder.price.gte(order.price)) && order.leaveQuantity.gt(0)) {
                const matchQuantity = new decimal_1.Decimal(Math.min(bestOrder.leaveQuantity.getValue(), order.leaveQuantity.getValue()));
                order.leaveQuantity = order.leaveQuantity.sub(matchQuantity);
                bestOrder.leaveQuantity = bestOrder.leaveQuantity.sub(matchQuantity);
                trades.push(new trade_1.default(orderId, bestOrder.price, matchQuantity, side));
                if (bestOrder.leaveQuantity.eq(new decimal_1.Decimal(0))) {
                    this.bids.shift();
                    delete this.orderIdMap[bestOrder.orderId];
                    bestOrder = this.bids.length ? this.bids[0] : null;
                }
            }
            if (order.leaveQuantity.gt(0)) {
                this.asks.push(order);
                this.asks.sort((a, b) => a.price.sub(b.price).getValue()); // 오름차순 정렬
            }
            (_b = (_d = this.quantityByPriceWithAsks)[price]) !== null && _b !== void 0 ? _b : (_d[price] = new decimal_1.Decimal(0));
            this.quantityByPriceWithAsks[price] = this.quantityByPriceWithAsks[price].add(order.leaveQuantity);
            if (this.quantityByPriceWithAsks[price].eq(0))
                delete this.quantityByPriceWithAsks[price];
            for (const trade of trades) {
                const tradePrice = trade.tradePrice.getValue().toString();
                this.quantityByPriceWithBids[tradePrice] = this.quantityByPriceWithBids[tradePrice].sub(trade.tradeQuantity);
                if (this.quantityByPriceWithBids[tradePrice].eq(0)) {
                    delete this.quantityByPriceWithBids[tradePrice];
                }
            }
        }
        if (order.leaveQuantity.gt(new decimal_1.Decimal(0))) {
            this.orderIdMap[order.orderId] = order;
        }
        return {
            order, trades
        };
    }
}
exports.default = Orderbook;
