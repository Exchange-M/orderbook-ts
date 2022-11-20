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

const { asks, bids } = orderbook.getOrderbook();

console.log(asks.length === 3)
console.log(bids.length === 0)

console.log(asks[0].price === '100', asks[0].quantity === '20')
console.log(asks[1].price === '110', asks[1].quantity === '10')
console.log(asks[2].price === '120', asks[2].quantity === '20')