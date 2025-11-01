import ORDER_TYPE from "../models/ORDER_TYPE";

export default class OrderTypeMapper {
    static fromStringToOrderType(orderTypeStr: string) : ORDER_TYPE {
        switch(orderTypeStr) {
            case "DineIn":
                return ORDER_TYPE.DINE_IN;
            case "Takeaway":
                return ORDER_TYPE.TAKEAWAY;
            case "Delivery":
                return ORDER_TYPE.DELIVERY;
            default:
                throw new Error(`Invalid order type string: ${orderTypeStr}`);
        }
    }

    static fromOrderTypeToString(orderType: ORDER_TYPE) : string {
        switch(orderType) {
            case ORDER_TYPE.DINE_IN:
                return "DineIn";
            case ORDER_TYPE.TAKEAWAY:
                return "Takeaway";
            case ORDER_TYPE.DELIVERY:
                return "Delivery";
            default:
                throw new Error(`Invalid order type: ${orderType}`);
        }
    }
        
}