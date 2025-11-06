export default class UserCustomization {
    orderId: string;
    itemId: string;

    customizationsValues: Record<string, any>;

    constructor(orderId: string, itemId: string, customizationsValues: Record<string, any>) {
        this.orderId = orderId;
        this.itemId = itemId;
        this.customizationsValues = customizationsValues;
    }
}