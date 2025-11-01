
export default interface TableReservationResponse {
    reservationId: string;
    tableNumber: number;
    customerName: string;
    reservationDate: string;
    reservationStatus: string;
    orderId: string;
    orderStatus: string;
}