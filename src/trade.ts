import { Decimal } from '@aficion360/decimal';

export enum TRADE_SIDE {
  ASK = 0,
  BID = 1,
}

class Trade {
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

  constructor(
    tradeId: number,
    sequence: number,
    makerOrderId: number,
    takerOrderId: number,
    makerSide: TRADE_SIDE,
    tradePrice: Decimal,
    tradeQuantity: Decimal,
  ) {
    this.tradeId = tradeId;
    this.sequence = sequence;
    this.makerOrderId = makerOrderId;
    this.takerOrderId = takerOrderId;
    this.makerSide = makerSide;
    this.takerSide = makerSide === TRADE_SIDE.BID ? TRADE_SIDE.ASK : TRADE_SIDE.BID;
    this.tradePrice = tradePrice;
    this.tradeQuantity = tradeQuantity;

    this.orderId = takerOrderId;
    this.tradeSide = this.takerSide;
  }
}

export default Trade;
