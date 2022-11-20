import Engine, { 
  Orderbook, 
  Order, 
  TRADE_SIDE, 
  IDataSourceHook, 
  Trade, 
  STRING_NUMBER 
} from '../src';

class DataSourceHook implements IDataSourceHook {
  async beforeAddHook (orderId: number, side: TRADE_SIDE, price: STRING_NUMBER, quantity: STRING_NUMBER): Promise<boolean> {
    console.log(`[before 주문등록] orderId: ${orderId}, side: ${side}, price: ${price}, quantity: ${quantity}`);
    return true;
  }
  async afterAddHook(order: Order, trades: Trade[]): Promise<boolean> {
    console.log(`[after 주문등록] 등록된 주문 아이디: ${order.orderId}, 채결된 주문 오더: ${trades.length}`);
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