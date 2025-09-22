export default class Table {
    tableNumber: number;
    seats: number;
    reservationCount: number;
    isFrozen: boolean;

    constructor(tableNumber: number = 0, seats: number = 0, reservationCount: number = 0, isFrozen: boolean = false) {
        this.tableNumber = tableNumber;
        this.seats = seats;
        this.reservationCount = reservationCount;
        this.isFrozen = isFrozen;
    }
}