import { v4 as uuidv4 } from 'uuid';

enum ReservationStatus {
    PENDING = 'PENDING',
    SEATED = 'SEATED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export default class TableReservation {
    reservationId: string;
    branchId: string;
    customerId: string;
    reservationTime: Date;
    tableNumber: number;
    endTime!: Date;
    seatedTime!: Date;
    reservationStatus!: ReservationStatus;

    constructor(data: { id?: string; branchId: string; customerId: string; tableNumber: number, reservationTime?: Date, reservationStatus?: ReservationStatus }) {
        this.branchId = data.branchId!;
        this.customerId = data.customerId!;
        this.tableNumber = data.tableNumber!;
        this.reservationId = data.id || uuidv4();
        this.reservationTime = data.reservationTime || new Date(Date.now());
        this.reservationStatus = data.reservationStatus || ReservationStatus.PENDING;
    }
}
