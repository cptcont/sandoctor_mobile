import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface TabProps {
    label: string; // Название вкладки
    isActive: boolean; // Активна ли вкладка
    onPress: () => void; // Обработчик нажатия
    isLast?: boolean; // Последняя ли это вкладка (для стилей)
    showDot?: boolean;
    color?: string;
}

const Tab: React.FC<TabProps> = ({ label, isActive, onPress, isLast = false, showDot = false, color = 'white' }) => {
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
            {showDot && <View style={[styles.dot, { backgroundColor: color }]} />}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    tab: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 30,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#ccc',
        borderBottomWidth: 1,
        borderBottomColor: '#ECECEC',
        borderRightWidth: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
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
    dot: {
        width: 7,
        height: 7,
        marginLeft: 8,
        borderRadius: 7,

    },
});

export default Tab;
