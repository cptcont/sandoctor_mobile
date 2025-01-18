import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ServiceCard from "@/components/ServiceCard";

type ServiceCardContainerProps = {
    title: string;
}

const ServiceCardContainer = ({ title  } : ServiceCardContainerProps) => {
    return (
        <View>
            <Text style={styles.title}>{title}</Text>
            <ServiceCard
                title={'Уничтожение тараканов'}
                value={'50 кв.м'}
                check={true}
                description={true}
            />
            <ServiceCard
                title={'Уничтожение тараканов'}
                value={'50 кв.м'}
                check={false}
                description={false}
            />
            <ServiceCard
                title={'Уничтожение тараканов'}
                value={'50 кв.м'}
                check={true}
                description={false}
            />
            <ServiceCard
                title={'Уничтожение тараканов'}
                value={'50 кв.м'}
                check={true}
                description={false}
            />
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
