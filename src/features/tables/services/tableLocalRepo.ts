import { db } from '../../offline-support/LocalDB';
import TableReservation from '../models/TableReservation';

export default class TableLocalRepo {
    async getTableReservationById(reservationId: string) : Promise<TableReservation | null> {
        return await db.tableReservations.get(reservationId) || null;
    }

    async addTableReservation(reservation: TableReservation): Promise<void> {
        await db.tableReservations.add(reservation);
    }
}

export const tableLocalRepo = new TableLocalRepo();