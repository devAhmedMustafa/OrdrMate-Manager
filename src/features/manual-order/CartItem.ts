export default class CartItem {
    name: string;
    itemId: string;
    price: number;
    quantity: number;
    customizations?: { [key: string]: any };

    public constructor({ name, itemId, price, quantity, customizations }: 
        { name: string; itemId: string; price: number; quantity: number; customizations?: { [key: string]: any } }) {
        this.name = name;
        this.itemId = itemId;
        this.price = price;
        this.quantity = quantity;
        this.customizations = customizations;
    }
}