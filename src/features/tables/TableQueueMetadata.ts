export default class TableQueueMetadata {
    tableNumber: number;
    numberOfReservations: number;

    constructor(tableNumber: number, numberOfReservations: number) {
        this.tableNumber = tableNumber;
        this.numberOfReservations = numberOfReservations;
    }
}