import { Decimal } from '@aficion360/decimal';
import Order from './order';
export declare class OrderNode {
    order: Order;
    level: PriceLevel;
    prev: OrderNode | null;
    next: OrderNode | null;
    constructor(order: Order, level: PriceLevel);
}
export declare class PriceLevel {
    price: Decimal;
    priceKey: string;
    totalQuantity: Decimal;
    head: OrderNode | null;
    tail: OrderNode | null;
    constructor(price: Decimal);
    push(order: Order): OrderNode;
    consumeHead(matchQty: Decimal): {
        order: Order;
        fullyFilled: boolean;
    };
    removeNode(node: OrderNode): void;
    isEmpty(): boolean;
}
