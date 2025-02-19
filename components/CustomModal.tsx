import React from 'react';
import { View, TouchableWithoutFeedback, StyleSheet, SafeAreaView, ViewStyle } from 'react-native';

type CustomModalProps = {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    overlay?: ViewStyle;
    overlayBackground?: ViewStyle;
    modalContent?:ViewStyle;


};

export const CustomModal: React.FC<CustomModalProps> = ({
                                                            visible,
                                                            onClose,
                                                            overlay = {alignItems: 'flex-end',},
                                                            overlayBackground = {backgroundColor: 'rgba(0, 0, 0, 0)',},
                                                            modalContent = {paddingTop: 60, paddingRight: 10,},
                                                            children }) => {
    if (!visible) {
        return null; // Не рендерить, если visible = false
    }

    return (
        <View style={[styles.overlay, overlay]}>
            {/* Оверлей, закрывающий модальное окно при клике */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={[styles.overlayBackground, overlayBackground]} />
            </TouchableWithoutFeedback>

            {/* Содержимое модального окна */}
            <SafeAreaView style={[styles.modalContent, modalContent]}>
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

    },
    overlayBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
         // Полупрозрачный фон
    },
    modalContent: {

    },
});
