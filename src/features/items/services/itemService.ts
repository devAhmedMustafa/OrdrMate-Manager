import OnlineEvent from "../../offline-support/OnlineEvent";
import { ItemDto } from "../dtos/ItemDto";
import ItemMapper from "../mappers/ItemMapper";
import { itemCloudService } from "./itemCloudService";
import { itemLocalRepo } from "./itemLocalRepo";

export default class ItemService {

  async getAllItems(restaurantId: string): Promise<ItemDto[]> {
    if (OnlineEvent.getInstance().isOnline){
      const items = await itemCloudService.getRestaurantItems(restaurantId);
      for (const item of items) {
        const itemCreated = ItemMapper.fromDto(item);
        itemLocalRepo.addItem(itemCreated);
      }

      return items;
    }
    else {
      const items =  await itemLocalRepo.getItems();
      return items.map(item => ItemMapper.toDto(item));
    }
  }

}

export const itemService = new ItemService();