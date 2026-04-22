import { Decimal } from '@aficion360/decimal';
import Order from './order';

export class OrderNode {
  order: Order;
  level: PriceLevel;
  prev: OrderNode | null = null;
  next: OrderNode | null = null;

  constructor(order: Order, level: PriceLevel) {
    this.order = order;
    this.level = level;
  }
}

export class PriceLevel {
  price: Decimal;
  priceKey: string;
  totalQuantity: Decimal = new Decimal(0);
  head: OrderNode | null = null;
  tail: OrderNode | null = null;

  constructor(price: Decimal) {
    this.price = price;
    this.priceKey = price.toString();
  }

  push(order: Order): OrderNode {
    const node = new OrderNode(order, this);
    if (!this.tail) {
      this.head = node;
      this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    this.totalQuantity = this.totalQuantity.add(order.leaveQuantity);
    return node;
  }

  // Decrement head order's leave quantity by matchQty.
  // Unlinks head if fully filled. Returns the head order.
  consumeHead(matchQty: Decimal): { order: Order; fullyFilled: boolean } {
    const node = this.head!;
    node.order.leaveQuantity = node.order.leaveQuantity.sub(matchQty);
    this.totalQuantity = this.totalQuantity.sub(matchQty);
    const fullyFilled = node.order.leaveQuantity.eq(0);
    if (fullyFilled) {
      this.head = node.next;
      if (this.head) this.head.prev = null;
      else this.tail = null;
      node.prev = null;
      node.next = null;
    }
    return { order: node.order, fullyFilled };
  }

  // Remove an arbitrary node (used by cancel). Subtracts node's remaining qty.
  removeNode(node: OrderNode): void {
    this.totalQuantity = this.totalQuantity.sub(node.order.leaveQuantity);
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;
    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;
    node.prev = null;
    node.next = null;
  }

  isEmpty(): boolean {
    return this.head === null;
  }
}
