export interface Checklists {
    checklists: Checklist[];
}
export interface Checklist {
    id: string;
    type: string;
    name: string;
    progress: number;
    zones: Zone[];
    badge: Badge;
}

export interface Zone {
    name: string;
    id: string;
    fields_arr: {
        [key: string]: string;
    };
    param_arr: Parameter[];
    param: ParameterDetail[];
}

export interface Parameter {
    id: string;
    name: string;
}

export interface ParameterDetail {
    name: string;
    id: string;
    fields: Field[];
}

export interface Field {
    id: string | null;
    label: string | null;
    type: string;
    options?: {
        [key: string]: {
            value: string;
            selected: boolean;
        };
    };
    value?: string | Photo[];
    name: string;
}

export interface Photo {
    name: string;
    thumbUrl: string;
    originalUrl: string;
}

export interface Badge {
    color: string;
}
