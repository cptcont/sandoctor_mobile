import React, { createContext, useContext, useState, ReactNode } from 'react';

// Определяем тип для данных контекста
interface ChecklistContextType {
    checklistData: any; // Замените `any` на конкретный тип ваших данных, если он известен
    updateChecklistData: (newData: any) => void; // Замените `any` на конкретный тип
}

// Создаем контекст с типом
const ChecklistContext = createContext<ChecklistContextType | undefined>(undefined);

// Пропсы для провайдера
interface ChecklistProviderProps {
    children: ReactNode; // Тип для children
}

// Провайдер контекста
export const ChecklistProvider: React.FC<ChecklistProviderProps> = ({ children }) => {
    const [checklistData, setChecklistData] = useState<any>({}); // Замените `any` на конкретный тип

    const updateChecklistData = (newData: any) => { // Замените `any` на конкретный тип
        setChecklistData(newData);
    };

    return (
        <ChecklistContext.Provider value={{ checklistData, updateChecklistData }}>
            {children}
        </ChecklistContext.Provider>
    );
};

// Хук для использования контекста
export const useChecklist = () => {
    const context = useContext(ChecklistContext);
    if (context === undefined) {
        throw new Error('useChecklist must be used within a ChecklistProvider');
    }
    return context;
};
