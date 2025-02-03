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
    title: string;
    task: Service[];

}

const ServiceCardContainer = ({ title, task  } : ServiceCardContainerProps) => {
    return (
        <View>
            <Text style={styles.title}>{title}</Text>
                {task.map((service: Service, index: number) => (
                    <ServiceCard
                        key={index}
                        title={service.service_name}
                        value={service.package}
                        unit={service.unit.name}
                        status={service.status.name}
                        color={service.status.color}
                    />
                ))}
        </View>
    )
};

const styles = StyleSheet.create({
    title: {
        paddingTop: 20,
        paddingBottom: 15,
        fontSize: 10,
        fontWeight: '500',
        color: '#939393',
    },

});

export default ServiceCardContainer;
