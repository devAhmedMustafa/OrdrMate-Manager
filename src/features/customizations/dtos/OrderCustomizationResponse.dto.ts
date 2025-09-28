export default interface OrderCustomizationResponse {
    orderId: string;
    items: {
        itemId: string;
        orderId: string;
        customization: {[key: string]: any};
    }[];
}