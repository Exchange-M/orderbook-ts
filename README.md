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

* used: ask -> bid

```ts
const order1 = orderbook.add(1, TRADE_SIDE.ASK, 100, 10);
const order2 = orderbook.add(2, TRADE_SIDE.ASK, 110, 10);
const order3 = orderbook.add(3, TRADE_SIDE.ASK, 100, 10);
```

```text
asks: 110 -> 10 (2)
      100 -> 20 (1, 3)
---------------  
bids: 
```

```ts
const order4 = orderbook.add(4, TRADE_SIDE.BID, 110, 11);
```

```ts
asks: 110 -> 10 (2)        110 -> 10 (2)
      100 -> 20 (1, 3)     100 -> 9 (3)
---------------         -> --------------
bids: 110 -> 11 (4)       

order5.trades: [
  Trade {
    orderId: 1,
    tradePrice: Decimal { intPart: '100', decPart: '' },
    tradeQuantity: Decimal { intPart: '10', decPart: '' },
    tradeSide: 0,
    tradeId: 1668825292207
  }
  Trade {
    orderId: 3,
    tradePrice: Decimal { intPart: '100', decPart: '' },
    tradeQuantity: Decimal { intPart: '1', decPart: '' },
    tradeSide: 0,
    tradeId: 1668825292207
  }
]
```

* used: bid -> ask

```ts
const order1 = orderbook.add(1, TRADE_SIDE.BID, 90, 10);
const order2 = orderbook.add(2, TRADE_SIDE.BID, 100, 10);
const order3 = orderbook.add(3, TRADE_SIDE.BID, 80, 10);
const order4 = orderbook.add(4, TRADE_SIDE.BID, 100, 10);
```

```text
asks: 
---------------  
bids: 100 -> 20 (2, 4)  
       90 -> 10 (1)
       80 -> 10 (3)
```

```ts
const order5 = orderbook.add(5, TRADE_SIDE.ASK, 80, 30);
```

```ts
asks:  80 -> 30 (3)         
---------------        ->  ---------         
bids: 100 -> 20 (2, 4)      80 -> 10 (3)
       90 -> 10 (1)         
       80 -> 10 (3)        

order5.trades: [
  Trade {
    orderId: 2,
    tradePrice: Decimal { intPart: '100', decPart: '' },
    tradeQuantity: Decimal { intPart: '10', decPart: '' },
    tradeSide: 0,
    tradeId: 1668825292207
  }
  Trade {
    orderId: 4,
    tradePrice: Decimal { intPart: '100', decPart: '' },
    tradeQuantity: Decimal { intPart: '10', decPart: '' },
    tradeSide: 0,
    tradeId: 1668825292207
  }
    Trade {
    orderId: 1,
    tradePrice: Decimal { intPart: '90', decPart: '' },
    tradeQuantity: Decimal { intPart: '10', decPart: '' },
    tradeSide: 0,
    tradeId: 1668825292207
  }
]
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