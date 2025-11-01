import TableResponse from "../dtos/TableResponse.dto";
import Table from "../models/Table";

export default class TableMapper {
    static fromResponseToModel(dto: TableResponse): Table {
        return new Table(
            dto.tableNumber,
            dto.seats,
            dto.reservationCount,
            dto.isFrozen
        );
    }

    static fromModelToResponse(entity: Table): TableResponse {
        return {
            tableNumber: entity.tableNumber,
            seats: entity.seats,
            reservationCount: entity.reservationCount,
            isFrozen: entity.isFrozen
        };
    }
}