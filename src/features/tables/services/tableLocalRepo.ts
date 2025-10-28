import { db } from '../../offline-support/LocalDB';
import TableReservation from '../models/TableReservation';

export default class TableLocalRepo {
    async getTableReservationById(reservationId: string) : Promise<TableReservation | null> {
        return await db.table('tableReservations').get(reservationId);
    }
}

export const tableLocalRepo = new TableLocalRepo();