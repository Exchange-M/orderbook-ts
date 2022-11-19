import { Decimal } from '@aficion360/decimal';
export declare enum TRADE_SIDE {
    ASK = 0,
    BID = 1
}
declare class Trade {
    orderId: number;
    tradePrice: Decimal;
    tradeQuantity: Decimal;
    tradeSide: TRADE_SIDE;
    tradeId: number;
    constructor(orderId: number, tradePrice: Decimal, tradeQuantity: Decimal, tradeSide: TRADE_SIDE);
}
export default Trade;
