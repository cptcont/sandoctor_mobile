export type Checklist = {
    id: string;
    type: string;
    name: string;
    zones: Zone[];
}

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
};

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

};
