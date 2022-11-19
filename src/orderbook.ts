import { Decimal } from '@aficion360/decimal';
import Trade, { TRADE_SIDE } from './trade';
import Order, { STRING_NUMBER } from './order';

class Orderbook {
  private asks: Array<Order> = [] // 오름차순 - sell - ASK
  private bids: Array<Order> = [] // 내림차순 - buy  - BID

  orderIdMap: {[key: number]: Order} = {};

  getAsks() {
    return this.asks;
  }

  getBids() {
    return this.bids;
  }

  cancel(orderId: number): Order {
    const order: Order | null = this.orderIdMap[orderId];
    
    if (order?.side === TRADE_SIDE.BID) {
      const index = this.bids.findIndex(bid => bid.orderId === orderId);
      if (index < 0) throw new Error(`NOT FOUND ORDERID: ${orderId}`);
      this.bids = this.bids.slice(0, index).concat(this.bids.slice(index + 1, this.bids.length));
    } else {
      const index = this.asks.findIndex(ask => ask.orderId === orderId);
      if (index < 0) throw new Error(`NOT FOUND ORDERID: ${orderId}`);
      this.asks = this.asks.slice(0, index).concat(this.asks.slice(index + 1, this.asks.length));
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
        
        // 채결 금액은 이미 오더북에 등록되어 있는 금액으로 채결한다.
        // 만약 ASK에 80, 90원이 등록되어 있는 상태에서 100원에 BID를 넣더라도 80원에 채결된다.
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
    } else { // 판매주문
      let bestOrder = this.bids.length ? this.bids[0] : null;

      while (bestOrder?.price.gte(order.price) && order.leaveQuantity.gt(0)) { 
        const matchQuantity = new Decimal(
          Math.min(bestOrder.leaveQuantity.getValue() as number, order.leaveQuantity.getValue() as number)
        );

        order.leaveQuantity = order.leaveQuantity.sub(matchQuantity);
        bestOrder.leaveQuantity = bestOrder.leaveQuantity.sub(matchQuantity);

        // 채결 금액은 이미 오더북에 등록되어 있는 금액으로 채결한다.
        // 만약 BID에 100, 90원이 등록된 상태에서 80에 ASK를 넣더라도 100원, 90원 순으로 채결된다.
        trades.push(
          new Trade(orderId, bestOrder.price, matchQuantity, side),
        ) 

        if (bestOrder.leaveQuantity.eq(0)) {
          this.bids.shift();
          delete this.orderIdMap[bestOrder.orderId];
          bestOrder = this.bids.length ? this.bids[0] : null;
        }
      }

      if (order.leaveQuantity.gt(0)) {
        this.asks.push(order);
        this.asks.sort((a, b) => a.price.sub(b.price).getValue() as number); // 오름차순 정렬
      }
    }

    if (order.leaveQuantity.gt(0)) {
      this.orderIdMap[order.orderId] = order;
    }

    return {
      order, trades
    };
  }

}

export default Orderbook;