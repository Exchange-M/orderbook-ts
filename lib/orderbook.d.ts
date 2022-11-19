import Trade, { TRADE_SIDE } from './trade';
import Order, { STRING_NUMBER } from './order';
declare class Orderbook {
    private asks;
    private bids;
    orderIdMap: {
        [key: number]: Order;
    };
    getAsks(): Order[];
    getBids(): Order[];
    cancel(orderId: number): Order;
    add(orderId: number, side: TRADE_SIDE, price: STRING_NUMBER, quantity: STRING_NUMBER): {
        order: Order;
        trades: Trade[];
    };
}
export default Orderbook;
