import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {TextButton} from "@/components/TextButton";

type ActorsCardProps = {
    name: string;
}

const ActorsCard = ({ name } : ActorsCardProps) => {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{'Исполнители'}</Text>
            <View style={styles.container}>
                <View style={{width: '50%'}}>
                    <Text style={styles.name}>{name}</Text>
                </View>
                <View style={{width: '50%'}}>
                    <Text style={styles.tel}>{name}</Text>
                </View>
            </View>
                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                    <View style={{marginRight: 13}}>
                    <TextButton text={'Отменить задание'}
                                type={'danger'}
                                size={170}
                    />
                    </View>
                    <TextButton text={'Приступить к выполнению'}
                                type={'success'}
                                size={170}
                    />
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
        marginBottom: 26,
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
        marginBottom: 28,
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
