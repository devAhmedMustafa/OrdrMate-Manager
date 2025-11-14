import ReservationStatus from "../enums/ReservationStatus";

export default class ReservationStatusMapper {
    static fromStringToReservationStatus(status: string): ReservationStatus {
        switch (status.toUpperCase()) {
            case 'WAITING':
                return ReservationStatus.WAITING;
            case 'SEATED':
                return ReservationStatus.SEATED;
            case 'LEFT':
                return ReservationStatus.LEFT;
            default:
                throw new Error(`Unknown reservation status: ${status}`);
        }
    }

    static fromReservationStatusToString(status: ReservationStatus): string {
        switch (status) {
            case ReservationStatus.WAITING:
                return 'WAITING';
            case ReservationStatus.SEATED:
                return 'SEATED';
            case ReservationStatus.LEFT:
                return 'LEFT';
            default:
                throw new Error(`Unknown reservation status: ${status}`);
        }
    }
}