import CartItem from "./CartItem";

export default class PlaceOrderRequestDto {
    branchId: string;
    items: CartItem[];
    orderType: number;
    paymentMethod: string = 'cash';
    tableNumber?: number;
    longitude?: number;
    latitude?: number;

    public constructor({ branchId, items, orderType, tableNumber, longitude, latitude }:
        { branchId: string; items: CartItem[]; orderType: number; tableNumber?: number; longitude?: number; latitude?: number }) {
        this.branchId = branchId;
        this.items = items;
        this.orderType = orderType;
        this.tableNumber = tableNumber;
        this.longitude = longitude;
        this.latitude = latitude;
    }
}