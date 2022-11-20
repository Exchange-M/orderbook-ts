import Order, { STRING_NUMBER } from './order';
import Trade, { TRADE_SIDE } from './trade';
import Orderbook from "./orderbook"

export interface IDataSourceHook {
  beforeAddHook: (orderId: number, side: TRADE_SIDE, price: STRING_NUMBER, quantity: STRING_NUMBER) => Promise<boolean>;
  afterAddHook: (order: Order, trades: Array<Trade>) => Promise<boolean>;
  beforeCancelHook: (orderId: number) => Promise<boolean>;
  afterCancelHook: (order: Order) => Promise<boolean>;
}

export type EngineOptions = {
  orderbook: Orderbook,
  dataSourceHook?: IDataSourceHook,
}

class Engine {
  private orderbook: Orderbook;
  private dataSourceHook?: IDataSourceHook;

  constructor (options: EngineOptions) {
    this.orderbook = options.orderbook;
    this.dataSourceHook = options?.dataSourceHook;
  }

  getOrderbook() {
    return this.orderbook.getOrderbook();
  }

  async cancel(orderId: number) {
    await this.dataSourceHook?.beforeCancelHook(orderId);
    const order = this.orderbook.cancel(orderId);
    await this.dataSourceHook?.afterCancelHook(order);
    return order;
  }

  async add(orderId: number, side: TRADE_SIDE, price: STRING_NUMBER, quantity: STRING_NUMBER): Promise<{ order: Order; trades: Array<Trade>; }> {
    await this.dataSourceHook?.beforeAddHook(orderId, side, price, quantity);
    const { order, trades } = this.orderbook.add(orderId, side, price, quantity);
    await this.dataSourceHook?.afterAddHook(order, trades);
    return { order, trades };
  }
}

export default Engine