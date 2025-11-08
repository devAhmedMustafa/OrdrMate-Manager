import OrderStatusMapper from "../../orders/mappers/orderStatusMapper";
import Order from "../../orders/models/Order";
import TableReservationResponse from "../dtos/TableReservationResponse";
import TableReservation from "../models/TableReservation";
import ReservationStatusMapper from "./ReservationStatusMapper";

export default class TableReservationMapper {

    static fromModelToDto(entity: TableReservation, order: Order): TableReservationResponse {

        return {
            reservationId:  entity.reservationId,
            tableNumber: entity.tableNumber,
            customerId: entity.customerId,
            branchId: entity.branchId,
            reservationDate: entity.reservationTime.toISOString(),
            customerName: "Offline Customer",
            reservationStatus: entity.reservationStatus,
            orderId: order.id,
            orderStatus: OrderStatusMapper.fromOrderStatusToString(order.status),
        }
    }

    static fromResponseToModel(dto: TableReservationResponse): TableReservation {
        return new TableReservation({
            id: dto.reservationId,
            branchId: dto.branchId,
            customerId: dto.customerId,
            tableNumber: dto.tableNumber,
            reservationTime: new Date(dto.reservationDate),
            reservationStatus: ReservationStatusMapper.fromStringToReservationStatus(dto.reservationStatus),
        });
    }

}