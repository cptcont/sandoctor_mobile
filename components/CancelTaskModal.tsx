import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { TextButton } from "@/components/TextButton";

interface CancelTaskModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (type: string, reason: string, comment: string) => void;
}

const CancelTaskModal: React.FC<CancelTaskModalProps> = React.memo(({ onClose, onSubmit }) => {
    const [reason, setReason] = useState('');
    const [comment, setComment] = useState('');

    return (
            <View style={styles.modalContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Причина отмены</Text>

                <View style={styles.separator} />

                <Text style={styles.label}>Комментарий исполнителя</Text>
                <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    editable
                    multiline
                    numberOfLines = {4}
                    placeholder="Введите информацию"
                />
                </View>
                <View style={styles.textButtonContainer}>
                <TextButton
                    text="Отказ клиента до выезда"
                    width={250}
                    height={31}
                    textSize={14}
                    textColor={'#FD1F9B'}
                    backgroundColor={'#FFEAF6'}
                    onPress={() => {
                        onSubmit('Продолжить', reason, comment)
                        onClose()
                    }}
                />
                </View>
                <TextButton
                    text="Ложный выезд"
                    width={250}
                    height={31}
                    textSize={14}
                    textColor={'#FD1F9B'}
                    backgroundColor={'#FFEAF6'}
                    onPress={() => {
                        onSubmit('Продолжить', reason, comment)
                        onClose()
                    }}
                />
            </View>
    );
});


const styles = StyleSheet.create({
    modalContainer: {
        width: 276,
        height: "auto",
        paddingTop: 12,
        paddingBottom: 22,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: -15,
        right: -15,
        backgroundColor: '#fff',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ECECEC',
    },
    closeButtonText: {
        fontSize: 24,
        color: '#000',

    },
    title: {
        paddingBottom: 18,
        paddingHorizontal: 13,
        alignSelf: 'flex-start',
        fontSize: 14,
        color: '#1B2B65',
        fontWeight: 'bold',
    },
    label: {
        paddingHorizontal: 13,
        alignSelf: 'flex-start',
        marginBottom: 10,
        fontSize: 12,
        fontWeight:'medium',


    },
    inputContainer: {
        width: '100%',
        paddingHorizontal: 13,
        marginBottom: 20,
    },
    input: {
        height: 63,
        backgroundColor: '#F5F7FB',
        borderRadius: 6,
        marginBottom: 10,
    },
    textArea: {
        height: 63,
    },
    separator: {
        width: '100%',
        marginBottom: 18,
        height: 1,
        backgroundColor: '#DADADA',
    },
    textButtonContainer: {
        marginBottom: 16,
    }
});

export default CancelTaskModal;
