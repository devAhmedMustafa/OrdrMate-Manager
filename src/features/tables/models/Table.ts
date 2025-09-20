export default class Table {
    tableNumber: number;
    seats: number;
    reservationCount: number;

    constructor(tableNumber: number = 0, seats: number = 0, reservationCount: number = 0) {
        this.tableNumber = tableNumber;
        this.seats = seats;
        this.reservationCount = reservationCount;
    }
}