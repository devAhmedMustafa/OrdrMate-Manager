import TableResponse from "../dtos/TableResponse.dto";
import Table from "../models/Table";

export default class TableMapper {
    static fromResponseToModel(dto: TableResponse): Table {
        return new Table({
            branchId: dto.branchId,
            tableNumber: dto.tableNumber,
            seats: dto.seats,
            isFrozen: dto.isFrozen  
        });
    }

    static fromModelToResponse(entity: Table, reservationCount: number): TableResponse {
        return {
            branchId: entity.branchId,
            tableNumber: entity.tableNumber,
            seats: entity.seats,
            reservationCount: reservationCount,
            isFrozen: entity.isFrozen
        };
    }
}