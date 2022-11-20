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

const order0 = orderbook.add(5, TRADE_SIDE.BID, 110, 11);

/*
      120 -> 20             120 -> 20 
      110 -> 10             110 -> 10   
asks: 100 -> 20       asks: 100 -> 9     
---------------   ->  ---------------    
bids: 110 -> 11       bids:    
*/

console.log(order0.order.leaveQuantity.toString() === '0')
console.log(order0.trades[0].tradePrice.toString() === '100', order0.trades[0].tradeQuantity.toString() === '10')
console.log(order0.trades[1].tradePrice.toString() === '100', order0.trades[1].tradeQuantity.toString() === '1')

const order1 = orderbook.add(6, TRADE_SIDE.BID, 120, 18);

/*
       120 -> 20             
       110 -> 10             120 -> 20   
 asks: 100 -> 9        asks: 110 -> 1     
 ---------------   ->  ---------------    
 bids: 120 -> 18       bids:    
*/

console.log(order1.order.leaveQuantity.toString() === '0')
console.log(order1.trades[0].tradePrice.toString() === '100', order1.trades[0].tradeQuantity.toString() === '9')
console.log(order1.trades[1].tradePrice.toString() === '110', order1.trades[1].tradeQuantity.toString() === '9')


const order2 = orderbook.add(6, TRADE_SIDE.BID, 105, 10);

/*
                  
       120 -> 20   
 asks: 110 -> 1     
 ---------------    
 bids: 105 -> 10  
*/

console.log(order2.order.leaveQuantity.toString() === '10')
console.log(order2.trades.length === 0)

const { asks, bids } = orderbook.getOrderbook();
console.log(asks.length === 2)
console.log(bids.length === 1)

console.log(asks[0].price === '110', asks[0].quantity === '1')
console.log(asks[1].price === '120', asks[1].quantity === '20')

console.log(bids[0].price === '105', bids[0].quantity === '10')