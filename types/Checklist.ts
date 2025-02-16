export type Checklist = {
    id: string;
    type: string;
    name: string;
    zones: Zone[];
};

// Тип для поля options в radio-кнопках
export type RadioOptions = {
    [key: string]: { value: string; selected: boolean };
};

// Тип для поля fields (поля формы)
export type Field = {
    id: string;
    label: string;
    type: 'radio' | 'text' | 'foto' | 'checkbox' | 'select';
    options?: RadioOptions; // Опционально, только для типа 'radio'
    value?: string; // Опционально, только для типа 'text'
    name: string;
    checked?: boolean;
    color?: string;
    selected?: boolean;
    access: Access[];
};

export type Access = {
    options: [];
}

// Тип для элемента param (параметры зоны)
export type Param = {
    name: string;
    id: string;
    fields: Field[];
};

// Тип для зоны (zone)
export type Zone = {
    name: string;
    id: string;
    fields_arr: {
        [key: string]: string; // Например, '1': 'Наличие проблемы'
    };
    param_arr: { id: string; name: string }[]; // Список параметров
    param: Param[]; // Детали параметров
    fields: Field[];
    control_points: Point[];
};

export interface Option {
    value: string;
    color: string;
    bgcolor?: string;
    selected: boolean;
}

export interface Fields {
    id: string;
    label: string;
    name: string;
    type: string;
    options?: Option[] | { [key: string]: Option };
}

export interface TMCValue {
    p: number;
    n: string;
    u: string;
    v: string;
}

export interface TMCField {
    name: string;
    value: TMCValue;
    fields: {
        p: { name: string; value: number };
        n: { name: string; value: string };
        u: { name: string; value: string };
        v: { name: string; value: string };
    };
}

export interface PestField {
    type: string;
    name: string;
    value: string;
}

export interface Pest {
    name: string;
    id: number;
    field: PestField;
}

export interface Point {
    name: string;
    point_name: string;
    id: string;
    fields: {
        access: Fields;
        point_status: Fields;
        mount_condition: Fields;
    };
    tmc: TMCField[];
    pests: Pest[];
}

