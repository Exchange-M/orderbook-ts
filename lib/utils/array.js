"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapSort = void 0;
const mapSort = (limit, obj, sortDirect) => {
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
};
exports.mapSort = mapSort;
