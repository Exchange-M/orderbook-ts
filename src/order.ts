import { Decimal } from '@aficion360/decimal';
import Trade, { TRADE_SIDE } from './trade';

export type STRING_NUMBER = string | number;

class Order {
  orderId: number;
  side: TRADE_SIDE;
  price: Decimal;
  quantity: Decimal;      // 주문수량
  leaveQuantity: Decimal; // 남은수량

  constructor(orderId: number, side: TRADE_SIDE, price: STRING_NUMBER, quantity: STRING_NUMBER, ) {
    this.orderId = orderId;
    this.side = side;
    this.price = new Decimal(price);
    this.quantity = new Decimal(quantity);
    this.leaveQuantity = new Decimal(quantity);
  }
}

export default Order;