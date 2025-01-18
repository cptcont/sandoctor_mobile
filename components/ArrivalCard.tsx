import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type ArrivalCardProps = {
    destination: string;
    address: string;
    route: string;
    arrivalDate: string;
    arrivalTime: string;
}

const ArrivalCard = ({ destination, address, route, arrivalDate, arrivalTime } : ArrivalCardProps) => {
    return (
        <View style={styles.card}>
            <Text style={styles.label}>{'Пункт назначения:'}</Text>
            <Text style={styles.value}>{destination}</Text>

            <Text style={styles.label}>{'Адрес:'}</Text>
            <Text style={styles.value}>{address}</Text>

            <Text style={styles.label}>{'Проезд:'}</Text>
            <Text style={styles.value}>{route}</Text>
            <View style={styles.container}>
                <View style={{width: '50%'}}>
                    <Text style={styles.label}>{'Дата прибытия:'}</Text>
                    <Text style={styles.value}>{arrivalDate}</Text>
                </View>
                <View style={{width: '50%'}}>
                    <Text style={styles.label}>{'Время прибытия:'}</Text>
                    <Text style={styles.value}>{arrivalTime}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '100%',
        backgroundColor: '#fff',
        paddingHorizontal: 13,
    },
    label: {
        fontSize: 12,
        fontWeight: 'medium',
        color: '#939393',
        marginBottom: 5,
    },
    value: {
        fontSize: 12,
        fontWeight: 'medium',
        color: '#000',
        marginBottom: 12,
    },
    container: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
});

export default ArrivalCard;
