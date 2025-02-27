import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ServiceCard from "@/components/ServiceCard";
import {usePost} from "@/context/PostApi";

interface Status {
    name: string;
    color: string;
    id: number;
}

interface Service {
    id: number;
    service_name: string;
    package: string;
    task_services_id: number;
    status: Status;
    unit: Status;
}

type ServiceCardContainerProps = {
    task: Service[];
    visible?: string;
    taskId?: string;
    task_services_id?: number;
    onServicesStatusChange?: (status: { services: { task_services_id: number; status: number }[] } | false) => void;
};

const ServiceCardContainer = ({ task, visible = 'view', onServicesStatusChange, taskId }: ServiceCardContainerProps) => {
    // Состояние для хранения статусов всех услуг
    const [servicesStatus, setServicesStatus] = useState<{ services: { task_services_id: number; status: number | null }[] }>({
        services: [],
    });
    const [statusClick, setStatusClick] = useState<{ [key: number]: boolean | null }>({});
    const { postData } = usePost();
    console.log('ServiceCardContainer.task', task[0].status);
    // Инициализация состояния при изменении task
    useEffect(() => {
    }, [task]);

    // Функция для обновления статуса конкретной услуги
    const handleStatusChange = (task_services_id: number, status: boolean | null) => {
        console.log('status', status);
        console.log('taskId', taskId);
    };

    // Отправляем servicesStatus родительскому компоненту при изменении
    useEffect(() => {

    }, []);

    return (
        <View>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Услуга</Text>
                {visible === 'edit' && (
                    <Text style={[styles.title, { marginRight: 18 }]}>Результат</Text>
                )}
            </View>
            {task.map((service: Service, index: number) => (
                <ServiceCard
                    key={index}
                    title={service.service_name}
                    value={service.package}
                    unit={service.unit.name}
                    statusId={Number(service.status.id)}
                    color={service.status.color}
                    task_services_id={Number(service.task_services_id)}
                    taskId={taskId}
                    visible={visible}

                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    title: {
        paddingTop: 20,
        paddingLeft: 12,
        paddingBottom: 12,
        fontSize: 10,
        fontWeight: '500',
        color: '#939393',
    },
});

export default ServiceCardContainer;
