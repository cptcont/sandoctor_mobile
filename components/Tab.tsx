import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface TabProps {
    label: string; // Название вкладки
    isActive: boolean; // Активна ли вкладка
    onPress: () => void; // Обработчик нажатия
    isLast?: boolean; // Последняя ли это вкладка (для стилей)
}

const Tab: React.FC<TabProps> = ({ label, isActive, onPress, isLast = false }) => {
    return (
        <TouchableOpacity
            style={[
                styles.tab,
                isActive && styles.activeTab,
                isLast && styles.lastTab,
            ]}
            onPress={onPress}
        >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    tab: {
        justifyContent: 'center',
        width: 71,
        height: 30,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#ECECEC',
        borderBottomWidth: 1,
        borderBottomColor: '#ECECEC',
        borderRightWidth: 0,
        backgroundColor: '#fff',
        marginRight: 0,
    },
    activeTab: {
        borderBottomWidth: 0,
        height: 31,
        marginBottom: -1,
        backgroundColor: '#fff',
    },
    lastTab: {
        borderRightWidth: 1,
    },
    tabText: {
        textAlign: 'center',
        fontSize: 10,
        fontWeight: '500',
        color: '#939393',
    },
    activeTabText: {
        color: '#000',
    },
});

export default Tab;
