import Orderbook, { TRADE_SIDE } from '../../src';

const orderbook = new Orderbook();

orderbook.add(1, TRADE_SIDE.ASK, 100, 10);
orderbook.add(2, TRADE_SIDE.ASK, 110, 10);
orderbook.add(3, TRADE_SIDE.ASK, 100, 10);
orderbook.add(4, TRADE_SIDE.ASK, 120, 20);

/*
      120 -> 20
      110 -> 10
asks: 100 -> 20
---------------  
bids: 
*/

const cancelOrder0 = orderbook.cancel(1);

/*
      120 -> 20
      110 -> 10
asks: 100 -> 10
---------------  
bids: 
*/
const ob0 = orderbook.getOrderbook();
console.log(ob0.asks.length === 3)
console.log(ob0.bids.length === 0)
