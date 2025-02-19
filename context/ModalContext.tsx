import React, { createContext, useContext, useState } from 'react';
import { ViewStyle } from 'react-native';

type ModalContextType = {
    isModalVisible: boolean;
    modalContent: React.ReactNode | null;
    overlayStyle?: ViewStyle;
    overlayBackgroundStyle?: ViewStyle;
    modalContentStyle?: ViewStyle;
    showModal: (content: React.ReactNode, styles?: { overlay?: ViewStyle; overlayBackground?: ViewStyle; modalContent?: ViewStyle }) => void;
    hideModal: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
    const [overlayStyle, setOverlayStyle] = useState<ViewStyle | undefined>(undefined);
    const [overlayBackgroundStyle, setOverlayBackgroundStyle] = useState<ViewStyle | undefined>(undefined);
    const [modalContentStyle, setModalContentStyle] = useState<ViewStyle | undefined>(undefined);

    const showModal = (content: React.ReactNode, styles?: { overlay?: ViewStyle; overlayBackground?: ViewStyle; modalContent?: ViewStyle }) => {
        setModalContent(content);
        setIsModalVisible(true);
        if (styles) {
            setOverlayStyle(styles.overlay);
            setOverlayBackgroundStyle(styles.overlayBackground);
            setModalContentStyle(styles.modalContent);
        }
    };

    const hideModal = () => {
        setIsModalVisible(false);
        setModalContent(null);
        setOverlayStyle(undefined);
        setOverlayBackgroundStyle(undefined);
        setModalContentStyle(undefined);
    };

    return (
        <ModalContext.Provider value={{ isModalVisible, modalContent, overlayStyle, overlayBackgroundStyle, modalContentStyle, showModal, hideModal }}>
            {children}
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
