import { Decimal } from '@aficion360/decimal';

const d = new Decimal('0');
const c = new Decimal('21');

const rst = d.lt(c); // d < c
console.log(rst)