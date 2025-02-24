import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckSolid, XMarkSolid, Document } from "@/components/icons/Icons";

type ServiceCardProps = {
    title?: string;
    value?: string;
    status?: string;
    unit?: string;
    color?: string;
    description?: boolean;
    visible?: string;
};

const ServiceCard = ({ title, value, unit, status, color, description, visible = 'view' }: ServiceCardProps) => {
    const [isCheckActive, setIsCheckActive] = useState(false);
    const [isXMarkActive, setIsXMarkActive] = useState(false);

    const handleCheckPress = () => {
        setIsCheckActive(prev => !prev);
        setIsXMarkActive(false);
    };

    const handleXMarkPress = () => {
        setIsXMarkActive(prev => !prev);
        setIsCheckActive(false);
    };

    const checkColor = isCheckActive ? '#30DA88' : '#5D6377';
    const checkBgColor = isCheckActive ? '#EAFBF3' : '#F5F7FB';
    const xMarkColor = isXMarkActive ? '#FD1F9B' : '#5D6377';
    const xMarkBgColor = isXMarkActive ? '#FFEAF6' : '#F5F7FB';

    return (
        <View style={styles.card}>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.value}>{`${value} ${unit}`}</Text>
            </View>
            {visible === 'view' && (
                <View style={styles.iconContainer}>
                    {description && (
                        <View style={styles.document}>
                            <Document />
                        </View>
                    )}
                    <View style={styles.statusIcon}>
                        {status === "Новая" && <CheckSolid color={color} />}
                        {status === "выполнена" && <XMarkSolid />}
                    </View>
                </View>
            )}
            {visible === 'edit' && (
                <View style={styles.editContainer}>
                    {description && (
                        <View style={styles.document}>
                            <Document />
                        </View>
                    )}
                    <View style={styles.editIcons}>
                        <TouchableOpacity
                            onPress={handleCheckPress}
                            style={[styles.iconButton, { backgroundColor: checkBgColor }]}
                        >
                            <CheckSolid color={checkColor} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleXMarkPress}
                            style={[styles.iconButton, { backgroundColor: xMarkBgColor }]}
                        >
                            <XMarkSolid color={xMarkColor} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderBottomColor: '#DADADA',
        borderBottomWidth: 1,
    },
    textContainer: {
        paddingLeft: 10,
    },
    title: {
        fontSize: 10,
        fontWeight: '400',
        color: '#1C1F37',
    },
    value: {
        fontSize: 10,
        fontWeight: '400',
        color: '#5D6377',
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    document: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        backgroundColor: '#F5F7FB',
        borderRadius: 15,
    },
    statusIcon: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editIcons: {
        flexDirection: 'row',
    },
    iconButton: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        marginRight: 10,
    },
});

export default ServiceCard;
