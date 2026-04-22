# Orderbook Matching Engine

go to [npm](https://www.npmjs.com/package/orderbook-match-engine)

* install

```bash
$ npm install orderbook-match-engine
```

## What's new in 2.0

### Behavior changes (review before upgrading)

Calls that previously failed silently or crashed later now throw immediately:

- `add(orderId, ...)` — throws on duplicate `orderId`, `price <= 0`, or `quantity <= 0`
- `cancel(orderId)` — throws if `orderId` is not in the book
- Hooks — if `beforeAddHook` / `beforeCancelHook` resolves to `false`, the operation throws (`ADD_REJECTED_BY_HOOK` / `CANCEL_REJECTED_BY_HOOK`). Previously the return value was ignored.

### New features

- **Self-Trade Prevention** — opt-in per order via the new 5th argument to `add()`. See [STP](#self-trade-prevention).
- **Event subscription** — `engine.events.on('trade' | 'orderAdded' | 'orderCancelled', fn)`. See [Events](#events).
- **Richer `Trade` model** — `tradeId` (monotonic counter, no longer `Date.now()`), `sequence`, `makerOrderId`, `takerOrderId`, `makerSide`, `takerSide`. Legacy `orderId` and `tradeSide` remain as deprecated aliases pointing at the taker.

The existing `Engine.add` / `Engine.cancel` / `getOrderbook` signatures are unchanged — these additions are backward compatible.

### provider

* Import 

```ts
import Engine, { 
  Orderbook, 
  Order, 
  TRADE_SIDE, 
  IDataSourceHook, 
  Trade, 
  STRING_NUMBER 
} from 'orderbook-match-engine';
```

* require

In a CommonJS environment, you can use it like this:

```js
const Engine = require('orderbook-match-engine').default;
const {   
  Orderbook, 
  Order, 
  TRADE_SIDE, 
  IDataSourceHook, 
  Trade, 
  STRING_NUMBER  
} = require('orderbook-match-engine');
```

* interface

```ts
interface IDataSourceHook {
  beforeAddHook: (orderId: number, side: TRADE_SIDE, price: STRING_NUMBER, quantity: STRING_NUMBER) => Promise<boolean>;
  afterAddHook: (order: Order, trades: Array<Trade>) => Promise<boolean>;
  beforeCancelHook: (orderId: number) => Promise<boolean>;
  afterCancelHook: (order: Order) => Promise<boolean>;
}

type EngineOptions = {
  orderbook: Orderbook,
  dataSourceHook?: IDataSourceHook,
}

type OrderbookOptions = {
  limit?: number, // (default: 15)
}
```

* create instance

```ts
class DataSourceHook implements IDataSourceHook {
  async beforeAddHook (orderId: number, side: TRADE_SIDE, price: STRING_NUMBER, quantity: STRING_NUMBER): Promise<boolean> {
    console.log(`[before order registry] orderId: ${orderId}, side: ${side}, price: ${price}, quantity: ${quantity}`);
    return true;
  }
  async afterAddHook(order: Order, trades: Trade[]): Promise<boolean> {
    console.log(`[after order registry] regitried orderId: ${order.orderId}, traded orderIds: ${trades.length}`);
    return true;
  }
  async beforeCancelHook(orderId: number): Promise<boolean> {
    return true;
  }
  async afterCancelHook(order: Order): Promise<boolean> {
    return true;
  }
}

const orderbook = new Orderbook({limit: 15});
const dataSourceHook = new DataSourceHook();

const engine = new Engine({
  orderbook,
  dataSourceHook,
});
```

In a javascript environment, you can use it like this:

```js
class DataSourceHook {
  async beforeAddHook (orderId, side, price, quantity) {
    console.log(`[before order registry] orderId: ${orderId}, side: ${side}, price: ${price}, quantity: ${quantity}`);
    return true;
  }
  async afterAddHook(order, trades) {
    console.log(`[after order registry] regitried orderId: ${order.orderId}, traded orderIds: ${trades.length}`);
    return true;
  }
  async beforeCancelHook(orderId) {
    return true;
  }
  async afterCancelHook(order) {
    return true;
  }
}

const orderbook = new Orderbook();
const dataSourceHook = new DataSourceHook();
const engine = new Engine({
  orderbook,
  dataSourceHook,
});
```

if hooks don't need, possible only use orderbook

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

### only orderbook 

* used: bid -> ask

More test cases are in **`./test/asks`**

```ts
import Engine, { 
  Orderbook, 
  Order, 
  Trade, 
  IDataSourceHook, 
  TRADE_SIDE, 
  STRING_NUMBER 
} from 'orderbook-match-engine';

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
import Engine, { 
  Orderbook, 
  Order, 
  Trade, 
  IDataSourceHook, 
  TRADE_SIDE, 
  STRING_NUMBER  
} from 'orderbook-match-engine';

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
import Engine, { 
  Orderbook, 
  Order, 
  Trade, 
  IDataSourceHook, 
  TRADE_SIDE, 
  STRING_NUMBER 
} from 'orderbook-match-engine';

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

console.log(ob0.asks[0].price === '100', ob0.asks[0].quantity === '10')
console.log(ob0.asks[1].price === '110', ob0.asks[1].quantity === '10')
console.log(ob0.asks[2].price === '120', ob0.asks[2].quantity === '20')
```

### engine

* used

```ts
import Engine, { 
  Orderbook, 
  Order, 
  Trade, 
  IDataSourceHook, 
  TRADE_SIDE, 
  STRING_NUMBER 
} from 'orderbook-match-engine'

class DataSourceHook implements IDataSourceHook {
  async beforeAddHook (orderId: number, side: TRADE_SIDE, price: STRING_NUMBER, quantity: STRING_NUMBER): Promise<boolean> {
    console.log(`[before order registry] orderId: ${orderId}, side: ${side}, price: ${price}, quantity: ${quantity}`);
    return true;
  }
  async afterAddHook(order: Order, trades: Trade[]): Promise<boolean> {
    console.log(`[after order registry] regitried orderId: ${order.orderId}, traded orderIds: ${trades.length}`);
    return true;
  }
  async beforeCancelHook(orderId: number): Promise<boolean> {
    return true;
  }
  async afterCancelHook(order: Order): Promise<boolean> {
    return true;
  }
}

const orderbook = new Orderbook({limit: 15});
const dataSourceHook = new DataSourceHook();

const engine = new Engine({
  orderbook,
  dataSourceHook,
});

async function main() {

  await engine.add(1, TRADE_SIDE.BID, 90, 10);
  await engine.add(2, TRADE_SIDE.BID, 100, 10);
  await engine.add(3, TRADE_SIDE.BID, 80, 10);
  await engine.add(4, TRADE_SIDE.BID, 100, 10);
  /*
  asks: 
  ---------------  
  bids: 100 -> 20
         90 -> 10
         80 -> 10
  */
  
  const order0 = await engine.add(5, TRADE_SIDE.ASK, 90, 10);
  /*
  asks: 90 -> 10        asks:     
  ---------------    -> ---------------       
  bids: 100 -> 20       bids: 100 -> 10     
         90 -> 10              90 -> 10       
         80 -> 10              80 -> 10      
  */
  
  const order1 = await engine.add(6, TRADE_SIDE.ASK, 100, 10);
  /*
  asks: 100 -> 10       asks:     
  ---------------    -> ---------------       
  bids: 100 -> 10       bids:  90 -> 10     
         90 -> 10              80 -> 10       
         80 -> 10              
  */
  
  const order2 = await engine.add(7, TRADE_SIDE.ASK, 90, 10);
  /*
  asks:  90 -> 10        asks:   
  ---------------    ->  ---------------       
  bids:  90 -> 10        bids: 80 -> 10
         80 -> 10                     
  */
  
  const { asks, bids } = await engine.getOrderbook()

  // 주문취소
  const createdOrder = await engine.cancel(3);
}

main();
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
const { asks, bids } = orderbook.getOrderbook();
// or
const { asks, bids } = await engine.getOrderbook();
```

### cancel order

* interface

```ts
const askOrder1 = orderbook.add(1, TRADE_SIDE.ASK, 100, 10);


orderbook.cancel(1);
// or 
await engine.cancel(1);
```

## Advanced

### Self-Trade Prevention

Prevent an account's order from matching its own resting order. Opt in per order via the 5th argument to `add()`:

```ts
import Engine, { Orderbook, TRADE_SIDE, STP_MODE } from 'orderbook-match-engine';

const engine = new Engine({ orderbook: new Orderbook() });

await engine.add(1, TRADE_SIDE.ASK, 100, 10, { accountId: 'alice' });

// No STP — self-trade is allowed (default)
await engine.add(2, TRADE_SIDE.BID, 100, 10, { accountId: 'alice' });

// CANCEL_NEW — incoming order's remaining quantity is dropped on first self-match.
// Trades against other accounts that occurred before the self-match are kept.
await engine.add(3, TRADE_SIDE.BID, 100, 10, {
  accountId: 'alice',
  stpMode: STP_MODE.CANCEL_NEW,
});
```

| Mode | Behavior |
|---|---|
| `STP_MODE.NONE` (default) | self-trade allowed |
| `STP_MODE.CANCEL_NEW` | drop incoming order's remaining quantity on self-match |

### Events

Engine exposes a typed event emitter (no external dependency).

```ts
engine.events.on('trade',          (trade) => console.log('TRADE', trade.tradeId, trade.tradeQuantity.toString()));
engine.events.on('orderAdded',     (order) => console.log('OPEN',  order.orderId));
engine.events.on('orderCancelled', (order) => console.log('CXL',   order.orderId));
```

Emission order per `add()` call:

1. `trade` events (one per fill, in match order) — fire **first** because they happened during execution
2. `orderAdded` — fires only if the order rests on the book (`leaveQuantity > 0`)

API: `on`, `off`, `once`, `emit`, `removeAllListeners`.

### Trade fields

```ts
class Trade {
  tradeId: number;        // monotonic counter, unique per Orderbook instance
  sequence: number;       // event sequence; trades from the same add() share one sequence
  makerOrderId: number;
  takerOrderId: number;
  makerSide: TRADE_SIDE;
  takerSide: TRADE_SIDE;
  tradePrice: Decimal;
  tradeQuantity: Decimal;

  /** @deprecated use takerOrderId */
  orderId: number;
  /** @deprecated use takerSide */
  tradeSide: TRADE_SIDE;
}
```

### Internals & Complexity

The orderbook is built on:

- `Map<priceKey, PriceLevel>` per side — O(1) price-level lookup
- Sorted `PriceLevel[]` per side — best price always at index 0 (asks ascending, bids descending), binary-searched insert
- Doubly-linked list of orders inside each `PriceLevel` — FIFO time priority, O(1) head pop
- `Map<orderId, OrderNode>` — O(1) cancel via direct node reference

Notation:
- **N** = total resting orders
- **L** = number of distinct price levels on a side
- **M** = number of resting orders consumed during a single `add()`
- **K** = number of listeners on a given event

| Operation | Time | Space |
|---|---|---|
| `add` — order rests on existing price level (no match) | O(1) | O(1) |
| `add` — order creates a new price level (no match) | O(log L) search + O(L) splice | O(1) |
| `add` — order matches M resting orders | O(M) per fill + O(L) per emptied level | O(M) for returned trades |
| `cancel` — level survives | **O(1)** | O(1) |
| `cancel` — last order in level removed | O(log L) search + O(L) splice | O(1) |
| `getOrderbook` / `getAsks` / `getBids` | O(`limit`) | O(`limit`) |
| `Engine.add` / `Engine.cancel` | same as `Orderbook` + hook latency + O(K) emit | same |
| `events.on` / `once` | O(1) | O(1) per listener |
| `events.off` | O(K) | — |
| `events.emit` | O(K) | — |
| **Total orderbook memory** | — | **O(N + L)** |

The hot paths (`cancel` of a non-emptying order, `add` against a single existing best level) are **O(1)**. The O(L) costs only appear when a price level is created or destroyed — `L` is typically small (hundreds to low thousands) compared to `N`.
```