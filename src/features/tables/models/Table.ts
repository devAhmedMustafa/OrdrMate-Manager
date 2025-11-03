export default class Table {
    branchId: string;
    tableNumber: number;
    seats: number;
    isFrozen: boolean;

    constructor(data : {branchId: string, tableNumber: number, seats: number, isFrozen?: boolean}) {
        this.branchId = data.branchId;
        this.tableNumber = data.tableNumber;
        this.seats = data.seats;
        this.isFrozen = data.isFrozen ?? false;
    }
}