import { Decimal } from '@aficion360/decimal';
import { TRADE_SIDE } from './trade';
export type STRING_NUMBER = string | number;
export type AccountId = string | number;
export declare enum STP_MODE {
    NONE = "NONE",
    CANCEL_NEW = "CANCEL_NEW"
}
export type OrderOptions = {
    accountId?: AccountId;
    stpMode?: STP_MODE;
};
declare class Order {
    orderId: number;
    side: TRADE_SIDE;
    price: Decimal;
    quantity: Decimal;
    leaveQuantity: Decimal;
    accountId?: AccountId;
    stpMode: STP_MODE;
    constructor(orderId: number, side: TRADE_SIDE, price: STRING_NUMBER, quantity: STRING_NUMBER, options?: OrderOptions);
}
export default Order;
