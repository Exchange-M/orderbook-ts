import { Decimal } from '@aficion360/decimal';

export enum TRADE_SIDE {
  ASK = 0,
  BID = 1, 
}

class Trade {
  orderId: number;
  tradePrice: Decimal;
  tradeQuantity: Decimal;
  tradeSide: TRADE_SIDE;
  tradeId: number;
  
  constructor (orderId: number, tradePrice: Decimal, tradeQuantity: Decimal, tradeSide: TRADE_SIDE) {
    this.orderId = orderId;
    this.tradePrice = tradePrice;
    this.tradeQuantity = tradeQuantity;
    this.tradeSide = tradeSide;
    this.tradeId = new Date().getTime();
  }
}

export default Trade;