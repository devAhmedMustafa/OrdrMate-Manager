import PlaceOrderRequestDto from "../../manual-order/PlaceOrderRequest.dto";
import Order from "../models/Order";

export default interface PushOrderRequest {
    order: Order;
    items: PlaceOrderRequestDto["items"];
    tableNumber?: PlaceOrderRequestDto["tableNumber"];
}