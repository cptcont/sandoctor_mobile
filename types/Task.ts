export type Task = {
    adress: string;
    comment: string;
    condition: TaskCondition;
    contacts: Contact[];
    date_begin_work: string;
    date_end_work: string;
    deal_id: string;
    executors: Executor[];
    id: string;
    owner_id: string | null;
    point: string;
    services: Service[];
    time_begin_work: string;
    time_end_work: string;
    tmc: TMC[];
};

export type TaskCondition = {
    bgcolor: string;
    color: string;
    id: string;
    name: string;
};

export type Contact = {
    fio: string;
    position: string;
    phone_1: string;
    // Добавьте другие поля, если они есть
};

export type Executor = {
    user: string;
    // Добавьте другие поля, если они есть
};

export type Service = {
    id: string;
    service_name: string;
    status: string;
    // Добавьте другие поля, если они есть
};

export type TMC = {
    // Определите поля для TMC, если они есть
};
