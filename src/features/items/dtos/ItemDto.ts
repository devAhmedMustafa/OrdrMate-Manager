export interface ItemDto {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  preparationTime: number;
  priority: number;
  tags: string;
  category: string;
  kitchenId: string;
  isAvailable?: boolean;
  kitchenName?: string;
}

export interface Kitchen {
  id: string;
  name: string;
  description: string;
  restaurantId: string;
}