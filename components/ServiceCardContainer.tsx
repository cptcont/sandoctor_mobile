import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ServiceCard from "@/components/ServiceCard";

interface Status {
    name: string;
    color: string;

}

interface Service {
    id: string;
    service_name: string;
    package: string;
    status: Status;
    unit: Status;
}

type ServiceCardContainerProps = {
    task: Service[];
    visible?: string

}

const ServiceCardContainer = ({ task, visible = 'view'  } : ServiceCardContainerProps) => {
    return (
        <View>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Услуга</Text>
                {visible === 'edit' && (
                <Text style={[styles.title, {marginRight:18}]}>Результат</Text>
                )}
            </View>
                {task.map((service: Service, index: number) => (
                    <ServiceCard
                        key={index}
                        title={service.service_name}
                        value={service.package}
                        unit={service.unit.name}
                        status={service.status.name}
                        color={service.status.color}
                        visible={visible}
                    />
                ))}

        </View>
    )
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
