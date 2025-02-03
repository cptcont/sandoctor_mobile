import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type ContactCardProps = {
    name: string;
    post: string;
    tel1: string;
    tel2?: string;
}

const ContactCard = ({ name, post, tel1, tel2 } : ContactCardProps) => {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{'Контактные лица'}</Text>
            <View style={styles.container}>
                <View style={{width: '50%'}}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.post}>{post}</Text>
                </View>
                <View style={{width: '50%'}}>
                    <Text style={styles.tel}>{tel1}</Text>
                    <Text style={styles.tel}>{tel2}</Text>
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
        paddingHorizontal: 13,
        marginBottom: 29,
        fontSize: 14,
        fontWeight: '500',
        color: '#1B2B65',
        paddingBottom: 15,
        borderBottomColor: '#DADADA',
        borderBottomWidth: 1,
    },
    container: {
        paddingHorizontal: 13,
        flexDirection: 'row',
        justifyContent: 'flex-start',
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

export default ContactCard;
