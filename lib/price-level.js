"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceLevel = exports.OrderNode = void 0;
const decimal_1 = require("@aficion360/decimal");
class OrderNode {
    constructor(order, level) {
        this.prev = null;
        this.next = null;
        this.order = order;
        this.level = level;
    }
}
exports.OrderNode = OrderNode;
class PriceLevel {
    constructor(price) {
        this.totalQuantity = new decimal_1.Decimal(0);
        this.head = null;
        this.tail = null;
        this.price = price;
        this.priceKey = price.toString();
    }
    push(order) {
        const node = new OrderNode(order, this);
        if (!this.tail) {
            this.head = node;
            this.tail = node;
        }
        else {
            node.prev = this.tail;
            this.tail.next = node;
            this.tail = node;
        }
        this.totalQuantity = this.totalQuantity.add(order.leaveQuantity);
        return node;
    }
    // Decrement head order's leave quantity by matchQty.
    // Unlinks head if fully filled. Returns the head order.
    consumeHead(matchQty) {
        const node = this.head;
        node.order.leaveQuantity = node.order.leaveQuantity.sub(matchQty);
        this.totalQuantity = this.totalQuantity.sub(matchQty);
        const fullyFilled = node.order.leaveQuantity.eq(0);
        if (fullyFilled) {
            this.head = node.next;
            if (this.head)
                this.head.prev = null;
            else
                this.tail = null;
            node.prev = null;
            node.next = null;
        }
        return { order: node.order, fullyFilled };
    }
    // Remove an arbitrary node (used by cancel). Subtracts node's remaining qty.
    removeNode(node) {
        this.totalQuantity = this.totalQuantity.sub(node.order.leaveQuantity);
        if (node.prev)
            node.prev.next = node.next;
        else
            this.head = node.next;
        if (node.next)
            node.next.prev = node.prev;
        else
            this.tail = node.prev;
        node.prev = null;
        node.next = null;
    }
    isEmpty() {
        return this.head === null;
    }
}
exports.PriceLevel = PriceLevel;
