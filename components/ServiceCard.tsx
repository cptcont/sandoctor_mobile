import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckSolid, XMarkSolid, Document } from "@/components/icons/Icons";
import { postData, } from '@/services/api'


type ServiceCardProps = {
    title?: string;
    value?: string;
    statusId?: string;
    unit?: string;
    color?: string;
    description?: boolean;
    visible?: string;
    onStatusChange?: (status: boolean | null) => void;
    task_services_id?: string;
    taskId?: string;
};

const ServiceCard = ({
                         title,
                         value,
                         unit,
                         statusId,
                         color,
                         description,
                         visible = 'view',
                         taskId,
                         task_services_id,
                         onStatusChange }: ServiceCardProps) => {

    const [isCheckActive, setIsCheckActive] = useState(true);
    const [isXMarkActive, setIsXMarkActive] = useState(false);

    // Функция для обновления состояний и вызова callback
    const updateStatus = (newCheckActive: boolean, newXMarkActive: boolean) => {
        setIsCheckActive(newCheckActive);
        setIsXMarkActive(newXMarkActive);

        // Определяем общее состояние

        if (!newCheckActive && !newXMarkActive) {
            if (onStatusChange) {
                onStatusChange(null); // Возвращаем null, если оба состояния false
            }
        } else {
            const overallStatus = newCheckActive && !newXMarkActive;
            if (onStatusChange) {
                onStatusChange(overallStatus); // Возвращаем общее состояние
            }
        }
    };
    useEffect(() => {
        console.log('statusId', statusId);
        if (statusId === undefined || statusId === null) return;

        let newCheckActive = false;
        let newXMarkActive = false;

        switch (statusId) {
            case '0':
                newCheckActive = false;
                newXMarkActive = false;
                break;
            case '3':
                newCheckActive = true;
                break;
            case '4':
                newXMarkActive = true;
                break;
            default:
                break;
        }

        setIsCheckActive(newCheckActive);
        setIsXMarkActive(newXMarkActive);
        updateStatus(newCheckActive, newXMarkActive);
    }, [statusId]);


    const handleCheckPress = async () => {
        if (!isCheckActive) {
            updateStatus(true, false); // Активируем Check и сбрасываем XMark
        }
         await postData(`task/${taskId}/`,
            {services:[{task_services_id: task_services_id, status: 3 }]});
    };

    const handleXMarkPress = async () => {
        if (!isXMarkActive) {
            updateStatus(false, true); // Активируем XMark и сбрасываем Check
        }
         await postData(`task/${taskId}/`,
            {services:[{task_services_id: Number(task_services_id), status: 4 }]});
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
                        {statusId === '0' && <CheckSolid color={color} />}
                        {statusId === '1' && <CheckSolid color={color} />}
                        {statusId === '2' && <CheckSolid color={color} />}
                        {statusId === '3' && <CheckSolid color={color} />}
                        {statusId === '4' && <XMarkSolid />}
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
