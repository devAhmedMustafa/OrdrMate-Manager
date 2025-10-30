export default class ItemCustomization {
    itemId: string;
    categoryId: string;

    constructor(data: { itemId: string; categoryId: string }) {
        this.itemId = data.itemId;
        this.categoryId = data.categoryId;
    }
}