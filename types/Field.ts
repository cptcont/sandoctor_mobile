type checkbox = {
    name: string;
    checked: boolean;
}

type text  = {
    name: string;
    value: string;
}

type radio = {
    name: string;
    options: any[];
}

type foto = {
    name: string;
    value: any[];
}

type select = {
    name: string;
    options: any[];
    value: string;
}

type tmc = {
    name: string;
    value: {
        n: {
            value: string;
        };
        u: {
            value: string;
        };
        v: {
            value: string;
        };
        p: {
            value: string;
        };
    }
}

type pest = {
    name: string;
    value: string;
}

export type TransferField = {
    text: text;
    radio: radio;
    foto: foto;
    select: select;
    tmc: tmc;
    pest: pest;
    type: string;
    label: string;
    name: string;
    value: string;
    checked: boolean;
    checkbox: checkbox;
    options: any[];
}

export type FormField = {
    type: string;
    label: string;
    name: string;
    value: string;
    checked: boolean;
    options: any[];

}

