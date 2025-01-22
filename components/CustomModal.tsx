import React from 'react';
import { View, TouchableWithoutFeedback, StyleSheet, SafeAreaView } from 'react-native';

type CustomModalProps = {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export const CustomModal: React.FC<CustomModalProps> = ({ visible, onClose, children }) => {
    if (!visible) {
        return null; // Не рендерить, если visible = false
    }

    return (
        <View style={styles.overlay}>
            {/* Оверлей, закрывающий модальное окно при клике */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlayBackground} />
            </TouchableWithoutFeedback>

            {/* Содержимое модального окна */}
            <SafeAreaView style={styles.modalContent}>
                {children}
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'flex-end',
    },
    overlayBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0)', // Полупрозрачный фон
    },
    modalContent: {
        paddingTop: 60,
        paddingRight: 10,
    },
});
