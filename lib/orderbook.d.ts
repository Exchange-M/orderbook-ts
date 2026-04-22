import Trade, { TRADE_SIDE } from './trade';
import Order, { STRING_NUMBER } from './order';
export type OrderbookOptions = {
    limit?: number;
};
declare class Orderbook {
    private askLevels;
    private askSorted;
    private bidLevels;
    private bidSorted;
    private orderIdMap;
    private limit;
    constructor(options?: OrderbookOptions);
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
    getAsks(): {
        price: string;
        quantity: string;
    }[];
    getBids(): {
        price: string;
        quantity: string;
    }[];
    private snapshot;
    cancel(orderId: number): Order;
    add(orderId: number, side: TRADE_SIDE, price: STRING_NUMBER, quantity: STRING_NUMBER): {
        order: Order;
        trades: Trade[];
    };
    private getOrCreateLevel;
    private removeLevel;
}
export default Orderbook;
