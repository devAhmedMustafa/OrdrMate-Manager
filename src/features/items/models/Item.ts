export default class Item {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    price: number;
    preparationTime: number;
    kitchenId: string;
    categoryName: string;
    priority: number = 0;
    tags: string[] = [];

    constructor({
        id, name, description, imageUrl, price, preparationTime, kitchenId, categoryName, priority = 0, tags = []
    } : {
        id: string;
        name: string;
        description: string;
        imageUrl: string;
        price: number;
        preparationTime: number;
        kitchenId: string;
        categoryName: string;
        priority?: number;
        tags?: string[];
    }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.price = price;
        this.preparationTime = preparationTime;
        this.kitchenId = kitchenId;
        this.categoryName = categoryName;
        this.priority = priority;
        this.tags = tags;
    }
}