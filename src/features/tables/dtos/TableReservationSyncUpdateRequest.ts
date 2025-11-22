export default interface TableReservationSyncUpdateRequest {
    reservationId: string;
    tableNumber?: number;
    seatedTime?: string;
    endTime?: string;
    reservationStatus?: string;
}