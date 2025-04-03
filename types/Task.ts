export interface Contact {
    email: string;
    fio: string;
    id: string;
    phone_1: string;
    phone_2: string;
    position: string;
    tc_id: string;
}

export interface Executor {
    id: string;
    user: string;
    user_id: string;
}

export interface Report {
    comment_client: string;
    comment_exec: string;
    task_id: string;
    time_end: string;
    time_start: string;
    work_len: number;
}

export interface Service {
    fragment_id: string;
    fragments_price: string;
    package: string;
    price: null | number;
    service_id: string;
    service_name: string;
    status: any; // Уточните тип, если возможно
    task_services_id: string;
    unit: any; // Уточните тип, если возможно
}

export interface TMC {
    edizm: string;
    id: string;
    name: string;
    quantity: string;
}

export interface Task {
    adress: string;
    comment: string;
    condition: {
        bgcolor: string;
        color: string;
        id: string;
        name: string;
    };
    contacts: Contact[];
    date_begin_work: string;
    date_end_work: string;
    deal_id: string;
    executors: Executor[];
    id: string;
    owner_id: null | string;
    point: string;
    report: Report;
    services: Service[];
    photos: photo[];
    time_begin_work: string;
    time_end_work: string;
    time_work: string;
    tmc: TMC[];
}

export interface photo {
    name: string;
    originalUrl: string;
    thumbUrl: string;

}
