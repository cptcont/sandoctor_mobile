import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ServiceCard from "@/components/ServiceCard";
import type {Service} from "@/types/Task";

type ServiceCardContainerProps = {
    task: Service[];
    visible?: string;
    taskId?: string;
    task_services_id?: string;
    onServicesStatusChange?: (status: { services: { task_services_id: number; status: number }[] } | false) => void;
};

const ServiceCardContainer = ({ task, visible = 'view', taskId }: ServiceCardContainerProps) => {
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
                    statusId={service.status.id}
                    color={service.status.color}
                    task_services_id={service.task_services_id}
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
