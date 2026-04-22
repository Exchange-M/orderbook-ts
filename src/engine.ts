import Order, { STRING_NUMBER, OrderOptions } from './order';
import Trade, { TRADE_SIDE } from './trade';
import Orderbook from "./orderbook"
import { TypedEventEmitter, EngineEvents } from './events';

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
  readonly events: TypedEventEmitter<EngineEvents> = new TypedEventEmitter<EngineEvents>();

  constructor(options: EngineOptions) {
    this.orderbook = options.orderbook;
    this.dataSourceHook = options?.dataSourceHook;
  }

  getOrderbook() {
    return this.orderbook.getOrderbook();
  }

  async cancel(orderId: number) {
    if (this.dataSourceHook) {
      const proceed = await this.dataSourceHook.beforeCancelHook(orderId);
      if (proceed === false) {
        throw new Error(`CANCEL REJECTED BY HOOK: ${orderId}`);
      }
    }
    const order = this.orderbook.cancel(orderId);
    await this.dataSourceHook?.afterCancelHook(order);
    this.events.emit('orderCancelled', order);
    return order;
  }

  async add(
    orderId: number,
    side: TRADE_SIDE,
    price: STRING_NUMBER,
    quantity: STRING_NUMBER,
    options?: OrderOptions,
  ): Promise<{ order: Order; trades: Array<Trade>; }> {
    if (this.dataSourceHook) {
      const proceed = await this.dataSourceHook.beforeAddHook(orderId, side, price, quantity);
      if (proceed === false) {
        throw new Error(`ADD REJECTED BY HOOK: ${orderId}`);
      }
    }
    const { order, trades } = this.orderbook.add(orderId, side, price, quantity, options);
    await this.dataSourceHook?.afterAddHook(order, trades);
    for (const t of trades) this.events.emit('trade', t);
    if (order.leaveQuantity.gt(0)) this.events.emit('orderAdded', order);
    return { order, trades };
  }
}

export default Engine
