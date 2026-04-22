"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STP_MODE = void 0;
const decimal_1 = require("@aficion360/decimal");
var STP_MODE;
(function (STP_MODE) {
    STP_MODE["NONE"] = "NONE";
    STP_MODE["CANCEL_NEW"] = "CANCEL_NEW";
})(STP_MODE || (exports.STP_MODE = STP_MODE = {}));
class Order {
    constructor(orderId, side, price, quantity, options) {
        var _a;
        this.orderId = orderId;
        this.side = side;
        this.price = new decimal_1.Decimal(price);
        this.quantity = new decimal_1.Decimal(quantity);
        this.leaveQuantity = new decimal_1.Decimal(quantity);
        this.accountId = options === null || options === void 0 ? void 0 : options.accountId;
        this.stpMode = (_a = options === null || options === void 0 ? void 0 : options.stpMode) !== null && _a !== void 0 ? _a : STP_MODE.NONE;
    }
}
exports.default = Order;
