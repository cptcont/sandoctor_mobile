import React, { createContext, useContext, useState } from 'react';
import { View, TouchableWithoutFeedback, ViewStyle } from 'react-native';

type ModalContextType = {
    isModalVisible: boolean;
    modalContent: React.ReactNode | null;
    overlayStyle?: ViewStyle;
    overlayBackgroundStyle?: ViewStyle;
    modalContentStyle?: ViewStyle;
    showModal: (
        content: React.ReactNode,
        styles?: {
            overlay?: ViewStyle;
            overlayBackground?: ViewStyle;
            modalContent?: ViewStyle;
        },
        onOverlayPress?: () => void // Добавляем callback для обработки нажатия на оверлей
    ) => void;
    hideModal: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
    const [overlayStyle, setOverlayStyle] = useState<ViewStyle | undefined>(undefined);
    const [overlayBackgroundStyle, setOverlayBackgroundStyle] = useState<ViewStyle | undefined>(undefined);
    const [modalContentStyle, setModalContentStyle] = useState<ViewStyle | undefined>(undefined);
    const [onOverlayPressCallback, setOnOverlayPressCallback] = useState<(() => void) | undefined>(undefined);

    const showModal = (
        content: React.ReactNode,
        styles?: {
            overlay?: ViewStyle;
            overlayBackground?: ViewStyle;
            modalContent?: ViewStyle;
        },
        onOverlayPress?: () => void // Callback для обработки нажатия на оверлей
    ) => {
        setModalContent(content);
        setIsModalVisible(true);
        if (styles) {
            setOverlayStyle(styles.overlay);
            setOverlayBackgroundStyle(styles.overlayBackground);
            setModalContentStyle(styles.modalContent);
        }
        setOnOverlayPressCallback(() => onOverlayPress); // Сохраняем callback
    };

    const hideModal = () => {
        setIsModalVisible(false);
        setModalContent(null);
        setOverlayStyle(undefined);
        setOverlayBackgroundStyle(undefined);
        setModalContentStyle(undefined);
        setOnOverlayPressCallback(undefined);
    };

    const handleOverlayPress = () => {
        if (onOverlayPressCallback) {
            onOverlayPressCallback(); // Вызываем callback, если он есть
        }
        hideModal();
    };

    return (
        <ModalContext.Provider
            value={{ isModalVisible, modalContent, overlayStyle, overlayBackgroundStyle, modalContentStyle, showModal, hideModal }}
        >
            {children}
            {isModalVisible && (
                <View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, overlayBackgroundStyle]}>
                    <TouchableWithoutFeedback onPress={handleOverlayPress}>
                        <View style={[{ flex: 1 }, overlayStyle]} />
                    </TouchableWithoutFeedback>
                    <View style={[{ position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }, overlayStyle]}>
                        <View style={modalContentStyle}>{modalContent}</View>
                    </View>
                </View>
            )}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
