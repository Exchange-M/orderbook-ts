import { Decimal } from "@aficion360/decimal";
export declare const mapSort: (limit: number, obj: {
    [key: string]: Decimal;
}, sortDirect: 1 | -1) => {
    price: string;
    quantity: string;
}[];
