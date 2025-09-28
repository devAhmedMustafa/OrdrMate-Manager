export default class OrderCustomization {
    orderId: string;
    items: {
        [key: string]: {
            [key: string]: any;
        };
    }

    constructor(data: {orderId: string; items: {itemId: string; orderId: string; customization: {[key: string]: any}}[]}) {
        this.orderId = data.orderId;
        this.items = {};
        data.items.forEach(item => {
            this.items[`${item.itemId},${item.orderId}`] = item.customization || {};
        });
    }
}