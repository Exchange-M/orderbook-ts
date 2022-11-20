import Order, { STRING_NUMBER } from './order';
import Trade, { TRADE_SIDE } from './trade';
import Orderbook from "./orderbook";
export interface IDataSourceHook {
    beforeAddHook: (orderId: number, side: TRADE_SIDE, price: STRING_NUMBER, quantity: STRING_NUMBER) => Promise<boolean>;
    afterAddHook: (order: Order, trades: Array<Trade>) => Promise<boolean>;
    beforeCancelHook: (orderId: number) => Promise<boolean>;
    afterCancelHook: (order: Order) => Promise<boolean>;
}
export type EngineOptions = {
    orderbook: Orderbook;
    dataSourceHook?: IDataSourceHook;
};
declare class Engine {
    private orderbook;
    private dataSourceHook?;
    constructor(options: EngineOptions);
    getOrderbook(): {
        asks: {
            price: string;
            quantity: string;
        }[];
        bids: {
            price: string;
            quantity: string;
        }[];
    };
    cancel(orderId: number): Promise<Order>;
    add(orderId: number, side: TRADE_SIDE, price: STRING_NUMBER, quantity: STRING_NUMBER): Promise<{
        order: Order;
        trades: Array<Trade>;
    }>;
}
export default Engine;
