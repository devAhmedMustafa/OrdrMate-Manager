
export default interface TableReservationResponse {
    reservationId: string;
    tableNumber: number;
    customerId: string;
    branchId: string;
    customerName: string;
    reservationDate: string;
    reservationStatus: string;
    orderId: string;
    orderStatus: string;
}