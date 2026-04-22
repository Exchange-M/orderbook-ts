"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRADE_SIDE = void 0;
var TRADE_SIDE;
(function (TRADE_SIDE) {
    TRADE_SIDE[TRADE_SIDE["ASK"] = 0] = "ASK";
    TRADE_SIDE[TRADE_SIDE["BID"] = 1] = "BID";
})(TRADE_SIDE || (exports.TRADE_SIDE = TRADE_SIDE = {}));
class Trade {
    constructor(tradeId, sequence, makerOrderId, takerOrderId, makerSide, tradePrice, tradeQuantity) {
        this.tradeId = tradeId;
        this.sequence = sequence;
        this.makerOrderId = makerOrderId;
        this.takerOrderId = takerOrderId;
        this.makerSide = makerSide;
        this.takerSide = makerSide === TRADE_SIDE.BID ? TRADE_SIDE.ASK : TRADE_SIDE.BID;
        this.tradePrice = tradePrice;
        this.tradeQuantity = tradeQuantity;
        this.orderId = takerOrderId;
        this.tradeSide = this.takerSide;
    }
}
exports.default = Trade;
