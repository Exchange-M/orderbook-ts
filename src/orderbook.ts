import { Decimal } from '@aficion360/decimal';
import Trade, { TRADE_SIDE } from './trade';
import Order, { STRING_NUMBER } from './order';
import { mapSort } from './utils/array';

export type OrderbookOptions = {
  limit?: number,
}

const ZERO = new Decimal(0);

const minDecimal = (a: Decimal, b: Decimal): Decimal => (a.lt(b) ? a : b);

class Orderbook {
  private asks: Array<Order> = [] // 오름차순 - sell - ASK
  private bids: Array<Order> = [] // 내림차순 - buy  - BID

  orderIdMap: {[key: number]: Order} = {};

  // which tree to use?
  quantityByPriceWithAsks: {[key: string]: Decimal} = {};
  quantityByPriceWithBids: {[key: string]: Decimal} = {};

  private limit: number;

  constructor (options?: OrderbookOptions) {
    this.limit = options?.limit || 15;
  }

  getOrderbook() {
    return {
      asks: this.getAsks(),
      bids: this.getBids(),
    };
  }

  getAsks() {
    return mapSort(this.limit, this.quantityByPriceWithAsks, 1)
  }

  getBids() {
    return mapSort(this.limit, this.quantityByPriceWithBids, -1)
  }

  cancel(orderId: number): Order {
    const order = this.orderIdMap[orderId];
    if (!order) {
      throw new Error(`NOT FOUND ORDERID: ${orderId}`);
    }

    const price = order.price.toString();

    if (order.side === TRADE_SIDE.BID) {
      const index = this.bids.findIndex(bid => bid.orderId === orderId);
      if (index < 0) throw new Error(`NOT FOUND ORDERID: ${orderId}`);
      this.bids = this.bids.slice(0, index).concat(this.bids.slice(index + 1, this.bids.length));
      this.quantityByPriceWithBids[price] = this.quantityByPriceWithBids[price].sub(order.leaveQuantity);
      if (this.quantityByPriceWithBids[price].eq(ZERO)) {
        delete this.quantityByPriceWithBids[price];
      }
    } else {
      const index = this.asks.findIndex(ask => ask.orderId === orderId);
      if (index < 0) throw new Error(`NOT FOUND ORDERID: ${orderId}`);
      this.asks = this.asks.slice(0, index).concat(this.asks.slice(index + 1, this.asks.length));
      this.quantityByPriceWithAsks[price] = this.quantityByPriceWithAsks[price].sub(order.leaveQuantity);
      if (this.quantityByPriceWithAsks[price].eq(ZERO)) {
        delete this.quantityByPriceWithAsks[price];
      }
    }

    delete this.orderIdMap[orderId];

    return order;
  }

  add(orderId: number, side: TRADE_SIDE, price: STRING_NUMBER, quantity: STRING_NUMBER) {
    if (this.orderIdMap[orderId]) {
      throw new Error(`DUPLICATE ORDERID: ${orderId}`);
    }

    const order = new Order(orderId, side, price, quantity);

    if (!order.price.gt(ZERO)) {
      throw new Error('price must be greater than 0');
    }
    if (!order.quantity.gt(ZERO)) {
      throw new Error('quantity must be greater than 0');
    }

    const priceKey = order.price.toString();
    const trades: Array<Trade> = [];

    if (side === TRADE_SIDE.BID) { // 구매주문
      let bestOrder = this.asks.length ? this.asks[0] : null;

      while (bestOrder?.price.lte(order.price) && order.leaveQuantity.gt(ZERO)) {
        const matchQuantity = minDecimal(bestOrder.leaveQuantity, order.leaveQuantity);

        order.leaveQuantity = order.leaveQuantity.sub(matchQuantity);
        bestOrder.leaveQuantity = bestOrder.leaveQuantity.sub(matchQuantity);

        trades.push(
          new Trade(orderId, bestOrder.price, matchQuantity, side),
        )

        if (bestOrder.leaveQuantity.eq(ZERO)) {
          this.asks.shift();
          delete this.orderIdMap[bestOrder.orderId];
          bestOrder = this.asks.length ? this.asks[0] : null;
        }
      }

      if (order.leaveQuantity.gt(ZERO)) {
        this.bids.push(order);
        this.bids.sort((a, b) => {
          if (a.price.gt(b.price)) return -1;
          if (a.price.lt(b.price)) return 1;
          return 0;
        });
        this.quantityByPriceWithBids[priceKey] ??= new Decimal(0);
        this.quantityByPriceWithBids[priceKey] = this.quantityByPriceWithBids[priceKey].add(order.leaveQuantity);
      }

      for (const trade of trades) {
        const tradePrice = trade.tradePrice.toString();
        this.quantityByPriceWithAsks[tradePrice] = this.quantityByPriceWithAsks[tradePrice].sub(trade.tradeQuantity);
        if (this.quantityByPriceWithAsks[tradePrice].eq(ZERO)) { delete this.quantityByPriceWithAsks[tradePrice] }
      }
    } else { // 판매주문
      let bestOrder = this.bids.length ? this.bids[0] : null;

      while (bestOrder?.price.gte(order.price) && order.leaveQuantity.gt(ZERO)) {
        const matchQuantity = minDecimal(bestOrder.leaveQuantity, order.leaveQuantity);

        order.leaveQuantity = order.leaveQuantity.sub(matchQuantity);
        bestOrder.leaveQuantity = bestOrder.leaveQuantity.sub(matchQuantity);

        trades.push(
          new Trade(orderId, bestOrder.price, matchQuantity, side),
        )

        if (bestOrder.leaveQuantity.eq(ZERO)) {
          this.bids.shift();
          delete this.orderIdMap[bestOrder.orderId];
          bestOrder = this.bids.length ? this.bids[0] : null;
        }
      }

      if (order.leaveQuantity.gt(ZERO)) {
        this.asks.push(order);
        this.asks.sort((a, b) => {
          if (a.price.gt(b.price)) return 1;
          if (a.price.lt(b.price)) return -1;
          return 0;
        });
        this.quantityByPriceWithAsks[priceKey] ??= new Decimal(0);
        this.quantityByPriceWithAsks[priceKey] = this.quantityByPriceWithAsks[priceKey].add(order.leaveQuantity);
      }

      for (const trade of trades) {
        const tradePrice = trade.tradePrice.toString();
        this.quantityByPriceWithBids[tradePrice] = this.quantityByPriceWithBids[tradePrice].sub(trade.tradeQuantity);
        if (this.quantityByPriceWithBids[tradePrice].eq(ZERO)) { delete this.quantityByPriceWithBids[tradePrice]; }
      }
    }

    if (order.leaveQuantity.gt(ZERO)) {
      this.orderIdMap[order.orderId] = order;
    }

    return {
      order, trades
    };
  }

}

export default Orderbook;
