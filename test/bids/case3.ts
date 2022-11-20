import  { Orderbook, TRADE_SIDE } from '../../src';

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

const order1 = orderbook.add(6, TRADE_SIDE.ASK, 100, 10);

console.log(order1.order.price.toString() === '100', order1.order.leaveQuantity.toString() === '0')
console.log(order1.trades[0].tradePrice.toString() === '100', order1.trades[0].tradeQuantity.toString() === '10')

/*
asks: 100 -> 10       asks:     
---------------    -> ---------------       
bids: 100 -> 10       bids:  90 -> 10     
       90 -> 10              80 -> 10       
       80 -> 10              
*/

const order2 =  orderbook.add(7, TRADE_SIDE.ASK, 90, 10);

console.log(order2.order.price.toString() === '90', order2.order.leaveQuantity.toString() === '0')
console.log(order2.trades[0].tradePrice.toString() === '90', order2.trades[0].tradeQuantity.toString() === '10')

/*
asks:  90 -> 10        asks:   
---------------    ->  ---------------       
bids:  90 -> 10        bids: 80 -> 10
       80 -> 10                     
*/

const { asks, bids } = orderbook.getOrderbook()

console.log( asks.length === 0 )
console.log( bids.length === 1 )

console.log(bids[0].price === '80', bids[0].quantity === '10')
