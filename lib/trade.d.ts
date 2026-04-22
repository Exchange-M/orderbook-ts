import { Decimal } from '@aficion360/decimal';
export declare enum TRADE_SIDE {
    ASK = 0,
    BID = 1
}
declare class Trade {
    tradeId: number;
    sequence: number;
    makerOrderId: number;
    takerOrderId: number;
    makerSide: TRADE_SIDE;
    takerSide: TRADE_SIDE;
    tradePrice: Decimal;
    tradeQuantity: Decimal;
    /** @deprecated Use takerOrderId. Kept for backward compatibility. */
    orderId: number;
    /** @deprecated Use takerSide. Kept for backward compatibility. */
    tradeSide: TRADE_SIDE;
    constructor(tradeId: number, sequence: number, makerOrderId: number, takerOrderId: number, makerSide: TRADE_SIDE, tradePrice: Decimal, tradeQuantity: Decimal);
}
export default Trade;
