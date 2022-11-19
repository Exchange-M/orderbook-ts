"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decimal_1 = require("@aficion360/decimal");
class Order {
    constructor(orderId, side, price, quantity) {
        this.orderId = orderId;
        this.side = side;
        this.price = new decimal_1.Decimal(price);
        this.quantity = new decimal_1.Decimal(quantity);
        this.leaveQuantity = new decimal_1.Decimal(quantity);
    }
}
exports.default = Order;
