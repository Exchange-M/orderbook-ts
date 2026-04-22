import { Decimal } from '@aficion360/decimal';
import { TRADE_SIDE } from './trade';

export type STRING_NUMBER = string | number;
export type AccountId = string | number;

export enum STP_MODE {
  NONE = 'NONE',
  CANCEL_NEW = 'CANCEL_NEW',
}

export type OrderOptions = {
  accountId?: AccountId;
  stpMode?: STP_MODE;
};

class Order {
  orderId: number;
  side: TRADE_SIDE;
  price: Decimal;
  quantity: Decimal;      // 주문수량
  leaveQuantity: Decimal; // 남은수량
  accountId?: AccountId;
  stpMode: STP_MODE;

  constructor(
    orderId: number,
    side: TRADE_SIDE,
    price: STRING_NUMBER,
    quantity: STRING_NUMBER,
    options?: OrderOptions,
  ) {
    this.orderId = orderId;
    this.side = side;
    this.price = new Decimal(price);
    this.quantity = new Decimal(quantity);
    this.leaveQuantity = new Decimal(quantity);
    this.accountId = options?.accountId;
    this.stpMode = options?.stpMode ?? STP_MODE.NONE;
  }
}

export default Order;
