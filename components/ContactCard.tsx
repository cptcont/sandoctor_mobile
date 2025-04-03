import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Contact = {
    id: string;
    fio: string;
    phone_1: string;
    phone_2?: string;
    email?: string;
    position: string;
};

type ContactCardProps = {
    contacts: Contact[];
};

const ContactCard = ({ contacts }: ContactCardProps) => {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{'Контактные лица'}</Text>
            {contacts.map((contact) => (
                <View key={`contact-${contact.id}`} style={styles.contactContainer}>
                    <View style={styles.container}>
                        <View style={{ width: '50%' }}>
                            <Text style={styles.name}>{contact.fio}</Text>
                            <Text style={styles.post}>{contact.position}</Text>
                            {contact.email ? (
                                <Text style={styles.email}>{contact.email}</Text>
                            ) : null}
                        </View>
                        <View style={{ width: '50%' }}>
                            {contact.phone_1 ? (
                                <Text style={styles.tel}>{contact.phone_1}</Text>
                            ) : null}
                            {contact.phone_2 ? (
                                <Text style={styles.tel}>{contact.phone_2}</Text>
                            ) : null}
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '100%',
        backgroundColor: '#fff',
    },
    title: {
        paddingHorizontal: 13,
        marginBottom: 15,
        fontSize: 14,
        fontWeight: '500',
        color: '#1B2B65',
        paddingBottom: 15,
        borderBottomColor: '#DADADA',
        borderBottomWidth: 1,
    },
    contactContainer: {
        marginBottom: 15,
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
        marginBottom: 5,
    },
    tel: {
        fontSize: 12,
        fontWeight: 'medium',
        color: '#000',
        marginBottom: 5,
    },
    email: {
        fontSize: 12,
        fontWeight: 'medium',
        color: '#1B2B65',
        marginBottom: 5,
    },
});

export default ContactCard;
