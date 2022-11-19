import { Decimal } from '@aficion360/decimal';
import Trade, { TRADE_SIDE } from './trade';
import Order, { STRING_NUMBER } from './order';

class Orderbook {
  private asks: Array<Order> = [] // 오름차순 - sell - ASK
  private bids: Array<Order> = [] // 내림차순 - buy  - BID

  orderIdMap: {[key: number]: Order} = {};
  
  // which tree to use?
  quantityByPriceWithAsks: {[key: string]: Decimal} = {};
  quantityByPriceWithBids: {[key: string]: Decimal} = {};

  getOrderbook() {
    return {
      asks: this.getAsks(),
      bids: this.getBids(),
    };
  }

  getAsks() {
    return Object
      .keys(this.quantityByPriceWithAsks)
      .sort((a, b) => this.quantityByPriceWithAsks[a].sub(this.quantityByPriceWithAsks[b]).lte(0) ? -1 : 1)
      .slice(0, 15)
      .map(price => ({
        price,
        quantity: this.quantityByPriceWithAsks[price].toString(),
      }));
  }

  getBids() {
    return Object
      .keys(this.quantityByPriceWithBids)
      .sort((a, b) => this.quantityByPriceWithBids[b].sub(this.quantityByPriceWithBids[a]).lte(0) ? -1 : 1)
      .slice(0, 15)
      .map(price => ({
          price,
          quantity: this.quantityByPriceWithBids[price].toString(),
      }));
  }

  cancel(orderId: number): Order {
    const order: Order | null = this.orderIdMap[orderId];
    const price = (order.price.getValue() as number).toString();

    if (order?.side === TRADE_SIDE.BID) {
      const index = this.bids.findIndex(bid => bid.orderId === orderId);
      if (index < 0) throw new Error(`NOT FOUND ORDERID: ${orderId}`);
      this.bids = this.bids.slice(0, index).concat(this.bids.slice(index + 1, this.bids.length));
      this.quantityByPriceWithBids[price] = this.quantityByPriceWithBids[price].sub(order.leaveQuantity);
    } else {
      const index = this.asks.findIndex(ask => ask.orderId === orderId);
      if (index < 0) throw new Error(`NOT FOUND ORDERID: ${orderId}`);
      this.asks = this.asks.slice(0, index).concat(this.asks.slice(index + 1, this.asks.length));
      this.quantityByPriceWithAsks[price] = this.quantityByPriceWithAsks[price].sub(order.leaveQuantity);
    }

    if (this.quantityByPriceWithAsks[price]?.eq(0)) {
      delete this.quantityByPriceWithAsks[price];
    }

    if (this.quantityByPriceWithBids[price]?.eq(0)) {
      delete this.quantityByPriceWithBids[price];
    }

    delete this.orderIdMap[orderId];

    return order;
  }

  add(orderId: number, side: TRADE_SIDE, price: STRING_NUMBER, quantity: STRING_NUMBER) {
    if (price === 0 || quantity === 0) {
      throw new Error('price and quantity must great then "0"');
    }
    const order = new Order(orderId, side, price, quantity);
    const trades: Array<Trade> = [];

    if (side === TRADE_SIDE.BID) { // 구매주문
      let bestOrder = this.asks.length ? this.asks[0] : null;

      while (bestOrder?.price.lte(order.price) && order.leaveQuantity.gt(0)) {
        
        const matchQuantity = new Decimal(
          Math.min(bestOrder.leaveQuantity.getValue() as number, order.leaveQuantity.getValue() as number)
        );

        order.leaveQuantity = order.leaveQuantity.sub(matchQuantity);
        bestOrder.leaveQuantity = bestOrder.leaveQuantity.sub(matchQuantity);
        
        trades.push(
          new Trade(orderId, bestOrder.price, matchQuantity, side),
        ) 

        if (bestOrder.leaveQuantity.eq(0)) {
          this.asks.shift();
          delete this.orderIdMap[bestOrder.orderId];
          bestOrder = this.asks.length ? this.asks[0] : null;
        }
      }
      
      if (order.leaveQuantity.gt(0)) {
        this.bids.push(order);
        this.bids.sort((a, b) => b.price.sub(a.price).getValue() as number); // 내림차순 정렬
      }

      this.quantityByPriceWithBids[price] = this.quantityByPriceWithBids[price] || new Decimal(0);
      this.quantityByPriceWithBids[price] = this.quantityByPriceWithBids[price].add(order.leaveQuantity);
      if (this.quantityByPriceWithBids[price].eq(0)) delete this.quantityByPriceWithBids[price];

      for (const trade of trades) {
        const tradePrice = (trade.tradePrice.getValue() as number).toString();
        this.quantityByPriceWithAsks[tradePrice] = this.quantityByPriceWithAsks[tradePrice].sub(trade.tradeQuantity);
        if (this.quantityByPriceWithAsks[tradePrice].eq(0)) {delete this.quantityByPriceWithAsks[tradePrice]}
      }
    } else { // 판매주문
      let bestOrder = this.bids.length ? this.bids[0] : null;

      while (bestOrder?.price.gte(order.price) && order.leaveQuantity.gt(0)) { 
        const matchQuantity = new Decimal(
          Math.min(bestOrder.leaveQuantity.getValue() as number, order.leaveQuantity.getValue() as number)
        );

        order.leaveQuantity = order.leaveQuantity.sub(matchQuantity);
        bestOrder.leaveQuantity = bestOrder.leaveQuantity.sub(matchQuantity);

        trades.push(
          new Trade(orderId, bestOrder.price, matchQuantity, side),
        ) 

        if (bestOrder.leaveQuantity.eq(new Decimal(0))) {
          this.bids.shift();
          delete this.orderIdMap[bestOrder.orderId];
          bestOrder = this.bids.length ? this.bids[0] : null;
        }
      }

      if (order.leaveQuantity.gt(0)) {
        this.asks.push(order);
        this.asks.sort((a, b) => a.price.sub(b.price).getValue() as number); // 오름차순 정렬
      }

      this.quantityByPriceWithAsks[price] = this.quantityByPriceWithAsks[price] || new Decimal(0);
      this.quantityByPriceWithAsks[price] = this.quantityByPriceWithAsks[price].add(order.leaveQuantity);
      if (this.quantityByPriceWithAsks[price].eq(0)) delete this.quantityByPriceWithAsks[price];

      for (const trade of trades) {
        const tradePrice = (trade.tradePrice.getValue() as number).toString();
        this.quantityByPriceWithBids[tradePrice] = this.quantityByPriceWithBids[tradePrice].sub(trade.tradeQuantity);
        if (this.quantityByPriceWithBids[tradePrice].eq(0)) {delete this.quantityByPriceWithBids[tradePrice];}
      }
    }

    if (order.leaveQuantity.gt(new Decimal(0))) {
      this.orderIdMap[order.orderId] = order;
    }

    return {
      order, trades
    };
  }

}

export default Orderbook;