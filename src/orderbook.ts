import { Decimal } from '@aficion360/decimal';
import Trade, { TRADE_SIDE } from './trade';
import Order, { STRING_NUMBER, OrderOptions, STP_MODE } from './order';
import { PriceLevel, OrderNode } from './price-level';

export type OrderbookOptions = {
  limit?: number,
}

const ZERO = new Decimal(0);

const minDecimal = (a: Decimal, b: Decimal): Decimal => (a.lt(b) ? a : b);

const insertSorted = (arr: PriceLevel[], level: PriceLevel, ascending: boolean): void => {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    const goRight = ascending
      ? arr[mid].price.lt(level.price)
      : arr[mid].price.gt(level.price);
    if (goRight) lo = mid + 1;
    else hi = mid;
  }
  arr.splice(lo, 0, level);
};

const findSortedIndex = (arr: PriceLevel[], price: Decimal, ascending: boolean): number => {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid].price.eq(price)) return mid;
    const goRight = ascending
      ? arr[mid].price.lt(price)
      : arr[mid].price.gt(price);
    if (goRight) lo = mid + 1;
    else hi = mid;
  }
  return -1;
};

class Orderbook {
  // best at index 0
  private askLevels: Map<string, PriceLevel> = new Map();
  private askSorted: PriceLevel[] = [];   // ascending
  private bidLevels: Map<string, PriceLevel> = new Map();
  private bidSorted: PriceLevel[] = [];   // descending

  private orderIdMap: Map<number, OrderNode> = new Map();

  private nextTradeId = 1;
  private nextSequence = 1;

  private limit: number;

  constructor(options?: OrderbookOptions) {
    this.limit = options?.limit || 15;
  }

  getOrderbook() {
    return {
      asks: this.getAsks(),
      bids: this.getBids(),
    };
  }

  getAsks() {
    return this.snapshot(this.askSorted);
  }

  getBids() {
    return this.snapshot(this.bidSorted);
  }

  private snapshot(sorted: PriceLevel[]) {
    const out: Array<{ price: string; quantity: string }> = [];
    const n = Math.min(this.limit, sorted.length);
    for (let i = 0; i < n; i++) {
      out.push({
        price: sorted[i].priceKey,
        quantity: sorted[i].totalQuantity.toString(),
      });
    }
    return out;
  }

  cancel(orderId: number): Order {
    const node = this.orderIdMap.get(orderId);
    if (!node) {
      throw new Error(`NOT FOUND ORDERID: ${orderId}`);
    }

    const level = node.level;
    const order = node.order;

    level.removeNode(node);
    this.orderIdMap.delete(orderId);

    if (level.isEmpty()) {
      this.removeLevel(order.side, level);
    }

    this.nextSequence++;
    return order;
  }

  add(
    orderId: number,
    side: TRADE_SIDE,
    price: STRING_NUMBER,
    quantity: STRING_NUMBER,
    options?: OrderOptions,
  ) {
    if (this.orderIdMap.has(orderId)) {
      throw new Error(`DUPLICATE ORDERID: ${orderId}`);
    }

    const order = new Order(orderId, side, price, quantity, options);

    if (!order.price.gt(ZERO)) {
      throw new Error('price must be greater than 0');
    }
    if (!order.quantity.gt(ZERO)) {
      throw new Error('quantity must be greater than 0');
    }

    const sequence = this.nextSequence++;
    const trades: Trade[] = [];
    const oppositeSide = side === TRADE_SIDE.BID ? TRADE_SIDE.ASK : TRADE_SIDE.BID;
    const oppositeSorted = side === TRADE_SIDE.BID ? this.askSorted : this.bidSorted;

    let stpTriggered = false;

    while (oppositeSorted.length > 0 && order.leaveQuantity.gt(ZERO)) {
      const bestLevel = oppositeSorted[0];
      const crosses = side === TRADE_SIDE.BID
        ? bestLevel.price.lte(order.price)
        : bestLevel.price.gte(order.price);
      if (!crosses) break;

      while (bestLevel.head && order.leaveQuantity.gt(ZERO)) {
        const headOrder = bestLevel.head.order;

        if (
          order.accountId !== undefined &&
          headOrder.accountId !== undefined &&
          headOrder.accountId === order.accountId &&
          order.stpMode === STP_MODE.CANCEL_NEW
        ) {
          order.leaveQuantity = ZERO;
          stpTriggered = true;
          break;
        }

        const matchQty = minDecimal(headOrder.leaveQuantity, order.leaveQuantity);
        order.leaveQuantity = order.leaveQuantity.sub(matchQty);
        const { order: matched, fullyFilled } = bestLevel.consumeHead(matchQty);

        trades.push(new Trade(
          this.nextTradeId++,
          sequence,
          matched.orderId,
          orderId,
          oppositeSide,
          bestLevel.price,
          matchQty,
        ));

        if (fullyFilled) {
          this.orderIdMap.delete(matched.orderId);
        }
      }

      if (bestLevel.isEmpty()) {
        oppositeSorted.shift();
        (oppositeSide === TRADE_SIDE.BID ? this.bidLevels : this.askLevels).delete(bestLevel.priceKey);
      }

      if (stpTriggered) break;
    }

    if (order.leaveQuantity.gt(ZERO)) {
      const level = this.getOrCreateLevel(side, order.price);
      const node = level.push(order);
      this.orderIdMap.set(orderId, node);
    }

    return { order, trades };
  }

  private getOrCreateLevel(side: TRADE_SIDE, price: Decimal): PriceLevel {
    const map = side === TRADE_SIDE.BID ? this.bidLevels : this.askLevels;
    const sorted = side === TRADE_SIDE.BID ? this.bidSorted : this.askSorted;
    const ascending = side === TRADE_SIDE.ASK;

    const key = price.toString();
    const existing = map.get(key);
    if (existing) return existing;

    const level = new PriceLevel(price);
    map.set(key, level);
    insertSorted(sorted, level, ascending);
    return level;
  }

  private removeLevel(side: TRADE_SIDE, level: PriceLevel): void {
    const map = side === TRADE_SIDE.BID ? this.bidLevels : this.askLevels;
    const sorted = side === TRADE_SIDE.BID ? this.bidSorted : this.askSorted;
    const ascending = side === TRADE_SIDE.ASK;

    map.delete(level.priceKey);
    const idx = findSortedIndex(sorted, level.price, ascending);
    if (idx >= 0) sorted.splice(idx, 1);
  }
}

export default Orderbook;
