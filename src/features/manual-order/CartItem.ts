export default class CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    customizations?: { [key: string]: any };

    public constructor({ id, name, price, quantity, customizations }: 
        { id: string; name: string; price: number; quantity: number; customizations?: { [key: string]: any } }) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.customizations = customizations;
    }
}