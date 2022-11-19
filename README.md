# Orderbook Matching Engine

* install

```bash
$ npm install orderbook
```

* import & create instance  

```typescript
import Orderbook, { TRADE_SIDE } from '../src';

const orderbook = new Orderbook();
```

### order

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

* used

```ts
const askOrder1 = orderbook.add(1, TRADE_SIDE.ASK, 100, 10);
const askOrder2 = orderbook.add(2, TRADE_SIDE.ASK, 110, 10);
const askOrder3 = orderbook.add(3, TRADE_SIDE.ASK, 100, 10);
```

### get order

* interface

```ts
getOrderbook(): {
    asks: Order[];
    bids: Order[];
};
getAsks(): Order[];
getBids(): Order[];
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
```

* get buy order

```ts
const bids = orderbook.getBids();
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