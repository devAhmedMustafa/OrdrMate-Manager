import OrderStatusMapper from "../../orders/mappers/orderStatusMapper";
import Order from "../../orders/models/Order";
import TableReservationResponse from "../dtos/TableReservationResponse";
import TableReservation from "../models/TableReservation";

export default class TableReservationMapper {

    static fromModelToDto(entity: TableReservation, order: Order): TableReservationResponse {

        return {
            reservationId:  entity.reservationId,
            tableNumber: entity.tableNumber,
            reservationDate: entity.reservationTime.toISOString(),
            customerName: "Offline Customer",
            reservationStatus: entity.reservationStatus,
            orderId: order.id,
            orderStatus: OrderStatusMapper.fromOrderStatusToString(order.status),
        }
    }

}