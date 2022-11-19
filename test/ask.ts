import Orderbook, { TRADE_SIDE } from '../src';

const orderbook = new Orderbook();

const bidOrder1 = orderbook.add(1, TRADE_SIDE.BID, 90, 10);
const bidOrder2 = orderbook.add(2, TRADE_SIDE.BID, 100, 10);
const bidOrder3 = orderbook.add(3, TRADE_SIDE.BID, 80, 10);
const bidOrder4 = orderbook.add(4, TRADE_SIDE.BID, 100, 10);

console.log('====== 오더북 =========')
console.log(orderbook.getAsks());
console.log(orderbook.getBids());
console.log('=====================')

const askOrder1 = orderbook.add(5, TRADE_SIDE.ASK, 80, 30);

console.log(askOrder1.order);
console.log(askOrder1.trades);

console.log(orderbook.getAsks());
console.log(orderbook.getBids())

console.log('======================')