import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type ActorsCardProps = {
    name_1: string;
    name_2?: string;
}

const ActorsCard = ({ name_1, name_2 } : ActorsCardProps) => {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{'Исполнители'}</Text>
            <View style={styles.container}>
                <View style={{width: '50%'}}>
                    <Text style={styles.name}>{name_1}</Text>
                </View>
                <View style={{width: '50%'}}>
                    <Text style={styles.tel}>{name_2}</Text>
                </View>
            </View>

        </View>
    )
};

const styles = StyleSheet.create({
    card: {
        width: '100%',
        backgroundColor: '#fff',
    },
    title: {
        paddingHorizontal: 10,
        marginBottom: 15,
        fontSize: 14,
        fontWeight: '500',
        color: '#1B2B65',
        paddingBottom: 15,
        borderBottomColor: '#DADADA',
        borderBottomWidth: 1,
    },
    container: {
        flexDirection: 'row',
        paddingHorizontal: 13,
        justifyContent: 'flex-start',
        marginBottom: 15,
    },
    name: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1C1F37',
        marginBottom: 5,
    },
    post: {
        fontSize: 12,
        fontWeight: 'medium',
        color: '#939393',

    },
    tel: {
        fontSize: 12,
        fontWeight: 'medium',
        color: '#000',
        marginBottom: 5,
    },

});

export default ActorsCard;
