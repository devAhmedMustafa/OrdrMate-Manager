export default interface OrderCustomizationResponse {
    orderId: string;
    items: {
        itemId: string;
        customization: {[key: string]: any};
    }[];
}