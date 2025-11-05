import { db } from '../../offline-support/LocalDB';
import ReservationStatus from '../enums/ReservationStatus';
import Table from '../models/Table';
import TableReservation from '../models/TableReservation';

export default class TableLocalRepo {
    async getTableReservationById(reservationId: string) : Promise<TableReservation | null> {
        return await db.tableReservations.get(reservationId) || null;
    }

    async addTableReservation(reservation: TableReservation): Promise<void> {
        await db.tableReservations.add(reservation);
    }

    async getTablesByBranch(branchId: string): Promise<Table[]> {
        return await db.seatTables.where('branchId').equals(branchId).toArray();
    }

    async updateTablesByBranch(branchId: string, tables: Table[]): Promise<void> {
        const existingTables = await this.getTablesByBranch(branchId);
        const existingTableNumbers = existingTables.map(t => t.tableNumber);
        const newTables = tables.filter(t => !existingTableNumbers.includes(t.tableNumber));
        const updatedTables = tables.filter(t => existingTableNumbers.includes(t.tableNumber));

        await db.seatTables.bulkPut(updatedTables);
        await db.seatTables.bulkAdd(newTables);
        const tablesToRemove = existingTables.filter(t => !tables.some(nt => nt.tableNumber === t.tableNumber));
        const tableIdsToRemove = tablesToRemove.map(t => t.tableNumber);
        await db.seatTables.bulkDelete(tableIdsToRemove);
    }

    async getTableQueue(branchId: string, tableNumber: number): Promise<TableReservation[]> {
        return await db.tableReservations
            .where({ branchId: branchId, tableNumber: tableNumber, ReservationStatus: [ReservationStatus.WAITING, ReservationStatus.SEATED, ReservationStatus.QUEUED] })
            .sortBy('reservationTime').then(reservations => reservations) || [];
    }

    async moveReservation(reservationId: string, toTableNumber: number): Promise<void> {
        const reservation = await this.getTableReservationById(reservationId);

        const oldTableNumber = reservation?.tableNumber;

        if (!reservation) {
            throw new Error('Reservation not found');
        }

        const isEmpty = await db.tableReservations
            .where({ tableNumber: toTableNumber })
            .count() === 0;

        if (!isEmpty) {
            // Handle case where target table is not empty
            return;
        }

        reservation.tableNumber = toTableNumber;
        await db.tableReservations.put(reservation);

        const peekReservationToOldTable = await db.tableReservations
            .where({ tableNumber: oldTableNumber! })
            .sortBy('reservationTime')
            .then(reservations => reservations[0]);

        if (peekReservationToOldTable) {
            await db.tableReservations.update(peekReservationToOldTable.reservationId, { reservationStatus: ReservationStatus.WAITING });
        }
    }

    async dequeueTable(branchId: string, tableNumber: number): Promise<void> {
        const reservations = await this.getTableQueue(branchId, tableNumber);
        if (reservations.length === 0) {
            return;
        }

        await db.tableReservations.update(reservations[0].reservationId, { reservationStatus: ReservationStatus.LEFT });

        if (reservations.length < 2) {
            return;
        }
        
        await db.tableReservations.update(reservations[1]?.reservationId, { reservationStatus: ReservationStatus.WAITING });
    }

    async freezeTable(branchId: string, tableNumber: number): Promise<void> {
        const table = await db.seatTables
            .where({ branchId: branchId, tableNumber: tableNumber })
            .first();

        if (!table) {
            throw new Error('Table not found');
        }

        table.isFrozen = true;
        await db.seatTables.put(table);
    }

    async unfreezeTable(branchId: string, tableNumber: number): Promise<void> {
        const table = await db.seatTables
            .where({ branchId: branchId, tableNumber: tableNumber })
            .first();

        if (!table) {
            throw new Error('Table not found');
        }

        table.isFrozen = false;
        await db.seatTables.put(table);
    }

    async createTable(table: Table): Promise<void> {
        await db.seatTables.add(table);
    }

}

export const tableLocalRepo = new TableLocalRepo();