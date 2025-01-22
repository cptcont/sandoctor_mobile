import React, { createContext, useContext, useState } from 'react';

type ModalContextType = {
    isModalVisible: boolean;
    modalContent: React.ReactNode | null;
    showModal: (content: React.ReactNode) => void;
    hideModal: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);

    const showModal = (content: React.ReactNode) => {
        setModalContent(content);
        setIsModalVisible(true);
    };

    const hideModal = () => {
        setIsModalVisible(false);
        setModalContent(null);
    };

    return (
        <ModalContext.Provider value={{ isModalVisible, modalContent, showModal, hideModal }}>
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
