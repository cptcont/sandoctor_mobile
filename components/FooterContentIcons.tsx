import { IconButton } from "@/components/IconButton";
import { ListIcon, TableCellsIcon } from "@/components/icons/Icons";
import { TextButton } from "@/components/TextButton";
import { View, StyleSheet } from 'react-native';
import { router } from "expo-router";
import React from "react";

type FooterContentIconsType = {
    visible?: boolean;
    onTodayPress?: () => void; // Добавляем пропсы для обработки нажатий
    onTomorrowPress?: () => void;
    screenName?: 'index' | 'daydetails';
};

const FooterContentIcons = ({ visible = true, onTodayPress, onTomorrowPress, screenName }: FooterContentIconsType) => {
    if (!visible) return null;

    const handleOnPressList = () => {
        router.push({
            pathname: '/daydetails',
            params: {},
        });
    };

    const handleOnPressTableCells = () => {
        router.push({
            pathname: '/',
            params: {},
        });
    };

    const handleOnPressToday = () => {
        if (onTodayPress) {
            onTodayPress(); // Вызываем переданный обработчик для HomeScreen
        } else {
            // Логика для DayDetailsScreen
            const today = new Date();
            router.push({
                pathname: '/daydetails',
                params: {
                    upLoad: 'upLoadToday',
                },
            });
        }
    };

    const handleOnPressTomorrow = () => {
        if (onTomorrowPress) {
            onTomorrowPress(); // Вызываем переданный обработчик для HomeScreen
        } else {
            // Логика для DayDetailsScreen
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            router.push({
                pathname: '/daydetails',
                params: {
                    upLoad: 'upLoadTomorrow',
                },
            });
        }
    };

    return (
        <View style={styles.container}>
            <IconButton
                icon={<ListIcon color={screenName === 'daydetails' ? '#F5F7FB' : '#5D6377'}/>}
                size={35}
                marginLeft={20}
                backgroundColor={screenName === 'daydetails' ? '#5D6377' : '#F5F7FB'}
                onPress={handleOnPressList} />
            <IconButton
                icon={<TableCellsIcon color={screenName === 'index' ? '#F5F7FB' : '#5D6377'}/>}
                size={35}
                marginLeft={8}
                backgroundColor={screenName === 'index' ? '#5D6377' : '#F5F7FB'}
                onPress={handleOnPressTableCells} />
            <TextButton
                text={'Сегодня'}
                width={112}
                height={35}
                textSize={14}
                textColor={'#5D6377'}
                backgroundColor={'#F5F7FB'}
                marginLeft={40}
                onPress={handleOnPressToday}
            />
            <TextButton
                text={'Завтра'}
                width={112}
                height={35}
                textSize={14}
                textColor={'#5D6377'}
                backgroundColor={'#F5F7FB'}
                marginLeft={10}
                onPress={handleOnPressTomorrow}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
});

export default FooterContentIcons;
