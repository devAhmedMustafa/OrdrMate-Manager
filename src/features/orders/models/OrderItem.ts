export default class OrderItem {
    orderId: string;
    itemId: string;
    quantity: number;

    constructor(data: {orderId: string, itemId: string, quantity: number}) {
        this.orderId = data.orderId;
        this.itemId = data.itemId;
        this.quantity = data.quantity;
    }
}