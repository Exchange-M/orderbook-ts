import { Decimal } from '@aficion360/decimal';
import Trade, { TRADE_SIDE } from './trade';
import Order, { STRING_NUMBER } from './order';
declare class Orderbook {
    private asks;
    private bids;
    orderIdMap: {
        [key: number]: Order;
    };
    quantityByPriceWithAsks: {
        [key: string]: Decimal;
    };
    quantityByPriceWithBids: {
        [key: string]: Decimal;
    };
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
    cancel(orderId: number): Order;
    add(orderId: number, side: TRADE_SIDE, price: STRING_NUMBER, quantity: STRING_NUMBER): {
        order: Order;
        trades: Trade[];
    };
}
export default Orderbook;
