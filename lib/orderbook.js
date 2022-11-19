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
class Orderbook {
    constructor() {
        this.asks = []; // 오름차순 - sell - ASK
        this.bids = []; // 내림차순 - buy  - BID
        this.orderIdMap = {};
    }
    getOrderbook() {
        return {
            asks: this.asks,
            bids: this.bids,
        };
    }
    getAsks() {
        return this.asks;
    }
    getBids() {
        return this.bids;
    }
    cancel(orderId) {
        const order = this.orderIdMap[orderId];
        if ((order === null || order === void 0 ? void 0 : order.side) === trade_1.TRADE_SIDE.BID) {
            const index = this.bids.findIndex(bid => bid.orderId === orderId);
            if (index < 0)
                throw new Error(`NOT FOUND ORDERID: ${orderId}`);
            this.bids = this.bids.slice(0, index).concat(this.bids.slice(index + 1, this.bids.length));
        }
        else {
            const index = this.asks.findIndex(ask => ask.orderId === orderId);
            if (index < 0)
                throw new Error(`NOT FOUND ORDERID: ${orderId}`);
            this.asks = this.asks.slice(0, index).concat(this.asks.slice(index + 1, this.asks.length));
        }
        delete this.orderIdMap[orderId];
        return order;
    }
    add(orderId, side, price, quantity) {
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
                // 채결 금액은 이미 오더북에 등록되어 있는 금액으로 채결한다.
                // 만약 ASK에 80, 90원이 등록되어 있는 상태에서 100원에 BID를 넣더라도 80원에 채결된다.
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
        }
        else { // 판매주문
            let bestOrder = this.bids.length ? this.bids[0] : null;
            while ((bestOrder === null || bestOrder === void 0 ? void 0 : bestOrder.price.gte(order.price)) && order.leaveQuantity.gt(0)) {
                const matchQuantity = new decimal_1.Decimal(Math.min(bestOrder.leaveQuantity.getValue(), order.leaveQuantity.getValue()));
                order.leaveQuantity = order.leaveQuantity.sub(matchQuantity);
                bestOrder.leaveQuantity = bestOrder.leaveQuantity.sub(matchQuantity);
                // 채결 금액은 이미 오더북에 등록되어 있는 금액으로 채결한다.
                // 만약 BID에 100, 90원이 등록된 상태에서 80에 ASK를 넣더라도 100원, 90원 순으로 채결된다.
                trades.push(new trade_1.default(orderId, bestOrder.price, matchQuantity, side));
                if (bestOrder.leaveQuantity.eq(0)) {
                    this.bids.shift();
                    delete this.orderIdMap[bestOrder.orderId];
                    bestOrder = this.bids.length ? this.bids[0] : null;
                }
            }
            if (order.leaveQuantity.gt(0)) {
                this.asks.push(order);
                this.asks.sort((a, b) => a.price.sub(b.price).getValue()); // 오름차순 정렬
            }
        }
        if (order.leaveQuantity.gt(0)) {
            this.orderIdMap[order.orderId] = order;
        }
        return {
            order, trades
        };
    }
}
exports.default = Orderbook;
