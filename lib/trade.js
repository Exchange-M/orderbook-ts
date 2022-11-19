"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRADE_SIDE = void 0;
var TRADE_SIDE;
(function (TRADE_SIDE) {
    TRADE_SIDE[TRADE_SIDE["ASK"] = 0] = "ASK";
    TRADE_SIDE[TRADE_SIDE["BID"] = 1] = "BID";
})(TRADE_SIDE = exports.TRADE_SIDE || (exports.TRADE_SIDE = {}));
class Trade {
    constructor(orderId, tradePrice, tradeQuantity, tradeSide) {
        this.orderId = orderId;
        this.tradePrice = tradePrice;
        this.tradeQuantity = tradeQuantity;
        this.tradeSide = tradeSide;
        this.tradeId = new Date().getTime();
    }
}
exports.default = Trade;
