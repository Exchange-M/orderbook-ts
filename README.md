# Orderbook Matching Engine

go to [npm](https://www.npmjs.com/package/orderbook-match-engine)

* install

```bash
$ npm install orderbook-match-engine
```

* import & create instance  

```typescript
import Orderbook, { TRADE_SIDE } from 'orderbook-match-engine';

const orderbook = new Orderbook();
```

### create order

* TRADE_SIDE

ASK: sell order

BID: buy order

```ts
export declare enum TRADE_SIDE {
    ASK = 0,
    BID = 1
}
```

* interface

```ts
add(
  orderId: number, 
  side: TRADE_SIDE, 
  price: STRING_NUMBER, 
  quantity: STRING_NUMBER
): {
    order: Order;
    trades: Trade[];
  }
```

* used: bid -> ask

More test cases are in **`./test/asks`**

```ts
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

```

* used: ask -> bid

More test cases are in **`./test/bids`**

```ts
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
```

* used: cancel

More test cases are in **`./test/cancel`**

```ts
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
```

### get order

* interface

```ts
getOrderbook(): {
    asks: Array<{ price: string, quantity: string }>;
    bids: Array<{ price: string, quantity: string }>;
};
getAsks(): Array<{ price: string, quantity: string }>;
getBids(): Array<{ price: string, quantity: string }>;
```

```ts 
declare class Order {
  orderId: number;
  side: TRADE_SIDE;
  price: Decimal;
  quantity: Decimal;
  leaveQuantity: Decimal;
}
```

* get sell order

```ts
const asks = orderbook.getAsks();

[
  { price: '110', quantity: '10' },
  { price: '120', quantity: '20' },
  { price: '100', quantity: '20' }
]
```

* get buy order

```ts
const bids = orderbook.getBids();

[
  { price: '100', quantity: '20' },
  { price: '90',  quantity: '10' },
  { price: '80',  quantity: '10' }
]
```

* get orderbook

```ts
const { asks, bids } = orderbook.getOrderbook()
```

### cancel order

* interface

```ts
const askOrder1 = orderbook.add(1, TRADE_SIDE.ASK, 100, 10);

orderbook.cancel(1);
```