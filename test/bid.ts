import Orderbook, { TRADE_SIDE } from '../src';

const orderbook = new Orderbook();

const askOrder1 = orderbook.add(1, TRADE_SIDE.ASK, 100, 10);
const askOrder2 = orderbook.add(2, TRADE_SIDE.ASK, 110, 10);
const askOrder3 = orderbook.add(3, TRADE_SIDE.ASK, 100, 10);

console.log('====== 오더북 =========')
console.log(orderbook.getAsks());
console.log(orderbook.getBids());
console.log('=====================')

console.log()
console.log()
const bidOrder4 = orderbook.add(4, TRADE_SIDE.BID, 110, 11);
console.log('====== 오더북 판매=========')
console.log(orderbook.getAsks());
console.log('====== 오더북 구매=========')
console.log(orderbook.getBids());

console.log('====== 주문결과 =========')
console.log(bidOrder4.order)
console.log(bidOrder4.trades)

console.log('======================')