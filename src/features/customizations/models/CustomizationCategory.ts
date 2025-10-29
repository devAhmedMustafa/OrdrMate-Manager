import { CustomizationMetadata } from "../enums/CustomizationMetadata";
import InputType from "../enums/InputType";

export default class CustomizationCategory {
    id: string;
    name: string;
    restaurantId: string;
    description: string;
    inputType: InputType;
    metadata: CustomizationMetadata;

    constructor(data: {
        id: string;
        name: string;
        restaurantId: string;
        description: string;
        inputType: InputType;
        metadata: CustomizationMetadata;
    }) {
        this.id = data.id;
        this.name = data.name;
        this.restaurantId = data.restaurantId;
        this.description = data.description;
        this.inputType = data.inputType;
        this.metadata = data.metadata;
    }

}