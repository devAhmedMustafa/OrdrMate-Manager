import CartItem from "./CartItem";

export default class PlaceOrderRequestDto {
    branchId: string;
    items: CartItem[];
    orderType: number;
    tableNumber?: number;

    public constructor({ branchId, items, orderType, tableNumber }:
        { branchId: string; items: CartItem[]; orderType: number; tableNumber?: number }) {
        this.branchId = branchId;
        this.items = items;
        this.orderType = orderType;
        this.tableNumber = tableNumber;
    }
}