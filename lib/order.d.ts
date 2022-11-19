import { Decimal } from '@aficion360/decimal';
import { TRADE_SIDE } from './trade';
export type STRING_NUMBER = string | number;
declare class Order {
    orderId: number;
    side: TRADE_SIDE;
    price: Decimal;
    quantity: Decimal;
    leaveQuantity: Decimal;
    constructor(orderId: number, side: TRADE_SIDE, price: STRING_NUMBER, quantity: STRING_NUMBER);
}
export default Order;
