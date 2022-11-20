import  { Orderbook, TRADE_SIDE } from '../../src';

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

const {order, trades} = orderbook.add(5, TRADE_SIDE.BID, 110, 11);

/*
      120 -> 20             120 -> 20 
      110 -> 10             110 -> 10   
asks: 100 -> 20       asks: 100 -> 9     
---------------   ->  ---------------    
bids: 110 -> 11       bids:    
*/

console.log(order.leaveQuantity.toString() === '0')
console.log(trades[0].tradePrice.toString() === '100', trades[0].tradeQuantity.toString() === '10')
console.log(trades[1].tradePrice.toString() === '100', trades[1].tradeQuantity.toString() === '1')

const { asks, bids } = orderbook.getOrderbook();
console.log(asks.length === 3)
console.log(bids.length === 0)

console.log(asks[0].price === '100', asks[0].quantity === '9')
console.log(asks[1].price === '110', asks[1].quantity === '10')
console.log(asks[2].price === '120', asks[2].quantity === '20')