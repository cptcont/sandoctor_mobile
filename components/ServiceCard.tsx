import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckSolid, XMarkSolid, Document } from "@/components/icons/Icons"

type ServiceCardProps = {
    title?: string;
    value?: string;
    status?: string;
    unit?: string;
    color?: string;
    description?: boolean;
}

const ServiceCard = ({ title, value, unit, status, color, description  } : ServiceCardProps) => {
    return (
        <View style={styles.card}>
            <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.title}>{`${value} ${unit}`}</Text>
            </View>
            <View style={styles.container}>
                {description &&
                    <View style={styles.document}>
                        <Document />
                    </View>
                }
                <View style={styles.check}>
                    {status === "Новая" && (
                        <CheckSolid color={color}/>
                    )}
                    {status === "выполнена" && (
                        <XMarkSolid />
                    )}
                </View>
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    card: {
        width: '100%',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        backgroundColor: '#fff',
        borderBottomColor: '#DADADA',
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 10,
        fontWeight: 'regular',
        color: '#1C1F37',
    },
    container: {
        flexDirection: 'row',
    },
    document: {
        width:30,
        height:30,
        alignItems:'center',
        justifyContent:'center',
        marginRight:5,
        backgroundColor:'#F5F7FB',
        borderRadius:50,
    },
    check: {
        width:30,
        height:30,
        alignItems:'center',
        justifyContent:'center',
    },

});

export default ServiceCard;
