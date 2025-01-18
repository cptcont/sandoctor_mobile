import React, { createContext, useContext, useState } from 'react';
import BottomPopup from '../components/BottomPopup';

interface PopupContextType {
    showPopup: (message: string, color: string, duration: number) => void;
}

const PopupContext = createContext<PopupContextType | null>(null);

export const usePopup = () => {
    const context = useContext(PopupContext);
    if (!context) {
        throw new Error('usePopup must be used within a PopupProvider');
    }
    return context;
};

export const PopupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [popup, setPopup] = useState<{ message: string; color: string; duration: number } | null>(null);

    const showPopup = (message: string, color: string, duration: number) => {
        setPopup({ message, color, duration });
    };

    const closePopup = () => {
        setPopup(null);
    };

    return (
        <PopupContext.Provider value={{ showPopup }}>
            {children}
            {popup && (
                <BottomPopup
                    message={popup.message}
                    color={popup.color}
                    duration={popup.duration}
                    onClose={closePopup}
                />
            )}
        </PopupContext.Provider>
    );
};
