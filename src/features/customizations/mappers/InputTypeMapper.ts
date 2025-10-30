import InputType from "../enums/InputType";

export default class InputTypeMapper {
    static fromStringToInputType(inputTypeStr: string): InputType {
        switch (inputTypeStr) {
            case 'SingleSelect':
                return InputType.SingleSelect;
            default:
                throw new Error(`Unknown input type: ${inputTypeStr}`);
        }
    }

    static fromInputTypeToString(inputType: InputType): 'SingleSelect' {
        switch (inputType) {
            case InputType.SingleSelect:
                return 'SingleSelect';
            default:
                throw new Error(`Unknown input type: ${inputType}`);
        }
    }
}

