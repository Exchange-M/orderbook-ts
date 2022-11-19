import Orderbook, { TRADE_SIDE } from '../../src';

const orderbook = new Orderbook();

orderbook.add(1, TRADE_SIDE.BID, 90, 10);
orderbook.add(2, TRADE_SIDE.BID, 100, 10);
orderbook.add(3, TRADE_SIDE.BID, 80, 10);
orderbook.add(4, TRADE_SIDE.BID, 100, 10);

/*
asks: 
---------------  
bids: 100 -> 20
       90 -> 10
       80 -> 10
*/

const order0 = orderbook.add(5, TRADE_SIDE.ASK, 90, 10);

console.log(order0.order.price.toString() === '90', order0.order.leaveQuantity.toString() === '0')
console.log(order0.trades[0].tradePrice.toString() === '100', order0.trades[0].tradeQuantity.toString() === '10')

/*
asks: 90 -> 10        asks:     
---------------    -> ---------------       
bids: 100 -> 20       bids: 100 -> 10     
       90 -> 10              90 -> 10       
       80 -> 10              80 -> 10      
*/

const { asks, bids } = orderbook.getOrderbook()
console.log( asks.length === 0 )
console.log( bids.length === 3 )

console.log(bids[0].price === '100', bids[0].quantity === '10')
console.log(bids[1].price === '90', bids[1].quantity === '10')
console.log(bids[2].price === '80', bids[2].quantity === '10')