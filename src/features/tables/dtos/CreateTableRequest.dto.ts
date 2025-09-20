export default class CreateTableRequest {
    tableNumber: number;
    seats: number;
    branchId: string;
    constructor({ tableNumber = 0, seats = 0, branchId = '' } = {}) {
        this.tableNumber = tableNumber;
        this.seats = seats;
        this.branchId = branchId;
    }
}