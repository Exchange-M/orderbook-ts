import Orderbook, { TRADE_SIDE } from '../src';

const orderbook = new Orderbook();

orderbook.add(1, TRADE_SIDE.ASK, 100, 10);
// orderbook.add(2, TRADE_SIDE.ASK, 110, 10);
// orderbook.add(3, TRADE_SIDE.ASK, 120, 10);

const orderCancel = orderbook.cancel(1)
console.log(orderCancel);
console.log(orderbook.getAsks());

console.log('===============')
const orderbook1 = new Orderbook();

orderbook1.add(1, TRADE_SIDE.ASK, 100, 10);
orderbook1.add(2, TRADE_SIDE.ASK, 110, 10);
// orderbook.add(3, TRADE_SIDE.ASK, 120, 10);

const orderCancel1 = orderbook1.cancel(1)
console.log(orderCancel);
console.log(orderbook.getAsks());

console.log('===============')
const orderbook2 = new Orderbook();

orderbook2.add(1, TRADE_SIDE.ASK, 100, 10);
orderbook2.add(2, TRADE_SIDE.ASK, 110, 10);
// orderbook.add(3, TRADE_SIDE.ASK, 120, 10);

const orderCancel2 = orderbook2.cancel(2)
console.log(orderCancel);
console.log(orderbook.getAsks());