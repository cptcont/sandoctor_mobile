import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { TextButton } from "@/components/TextButton";

interface StartTaskModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (type: string, conditionId: number, cancelReason: number, cancelComment: string) => void;
}

const StartTaskModal: React.FC<StartTaskModalProps> = React.memo(({ onClose, onSubmit }) => {
    const type = 'start';

    return (
        <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Обратите внимание</Text>

            <View style={styles.separator} />

            <Text style={styles.label}>Вы начинаете работу над
                заданием это действие необратимо. Такое задание нельзя будет отменить.</Text>
                <TextButton
                    text="Продолжить"
                    width={244}
                    height={31}
                    textSize={14}
                    textColor={'#30DA88'}
                    backgroundColor={'#EAFBF3'}
                    onPress={() => {
                        onSubmit(type, 2, 0, '')
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
        marginBottom: 27,
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

export default StartTaskModal;
