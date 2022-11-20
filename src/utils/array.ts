import { Decimal } from "@aficion360/decimal"

export const mapSort = (limit: number, obj:  {[key: string]: Decimal}, sortDirect: 1 | -1) => {
  return Object
    .keys(obj)
    .sort((a, b) => {
      return parseFloat(a) - parseFloat(b) > 0 ? sortDirect : -sortDirect;
    })
    .slice(0, limit)
    .map(price => ({
      price,
      quantity: obj[price].toString(),
    }));
}