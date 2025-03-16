export type RadioField = {
    label: string;
    name: string;
    no: boolean;
    yes: boolean;
};

export type TextField = {
    label: string;
    name: string;
    value: string;

};

export type CheckboxField = {
    checked: boolean;
    label: string;
    name: string;
};

export type SelectField = {
    label: string;
    name: string;
    options: any[]; // Здесь можно уточнить тип, если известна структура объекта options

};

export type TransferField = {
    type: string;
    label: string;
    name: string;
    value: string;
    checked: boolean;
    options: any[];
}

export type FormField = {
    radio: RadioField;
    text: TextField;
    checkbox: CheckboxField;
    select: SelectField;

}

