import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';

// Тип для состояния сети
interface NetworkState {
    isConnected: boolean | null;
    type: NetInfoStateType | null;
}

// Тип для контекста
interface NetworkContextType {
    isConnected: boolean | null;
    type: NetInfoStateType | null;
}

// Создаем контекст с начальным значением undefined
const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

// Провайдер контекста
export const NetworkProvider = ({ children }: { children: ReactNode }) => {
    const [networkState, setNetworkState] = useState<NetworkState>({
        isConnected: null,
        type: null,
    });

    useEffect(() => {
        // Подписка на изменения состояния сети
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            setNetworkState({
                isConnected: state.isConnected,
                type: state.type,
            });
        });

        // Проверка начального состояния сети
        NetInfo.fetch().then((state: NetInfoState) => {
            setNetworkState({
                isConnected: state.isConnected,
                type: state.type,
            });
        });

        // Отписка при размонтировании
        return () => unsubscribe();
    }, []);

    return (
        <NetworkContext.Provider value={networkState}>
            {children}
        </NetworkContext.Provider>
    );
};

// Хук для использования контекста
export const useNetwork = (): NetworkContextType => {
    const context = useContext(NetworkContext);
    if (context === undefined) {
        throw new Error('useNetwork must be used within a NetworkProvider');
    }
    return context;
};
