import { v4 as uuidv4 } from 'uuid';

export default class TableReservation {
    reservationId: string = uuidv4();
    branchId: string;
    customerId: string;
    reservationTime: Date = new Date(Date.now());
    tableNumber: number;
    endTime!: Date;
    seatedTime!: Date;

    constructor(data: { branchId: string; customerId: string; tableNumber: number }) {
        this.branchId = data.branchId!;
        this.customerId = data.customerId!;
        this.tableNumber = data.tableNumber!;
    }
}
