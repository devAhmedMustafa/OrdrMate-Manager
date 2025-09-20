import { OrderStatus } from "../services/tableService";

export default interface ReservationNotification {
  Type: 'TableReserved';
  Reservation: {
    ReservationId: string;
    TableNumber: number;
    CustomerName: string;
    ReservationDate: string;
    ReservationStatus: string;
    OrderId: string;
    OrderStatus: OrderStatus;
  };
}