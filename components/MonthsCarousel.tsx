import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import {
    getYear,
    getMonth,
    isSameMonth,
    eachMonthOfInterval,
    startOfYear,
    endOfYear,
} from 'date-fns';
//import { ru } from 'date-fns/locale';

interface MonthsCarouselProps {
    year?: number;
    month?: number;
    onMonthChange?: (year: number, month: number) => void;
}

const MonthsCarousel: React.FC<MonthsCarouselProps> = ({
                                                           year = new Date().getFullYear(),
                                                           month = new Date().getMonth() + 1,
                                                           onMonthChange,
                                                       }) => {
    const [selectedDate, setSelectedDate] = useState(new Date(year, month - 1)); // Устанавливаем выбранную дату
    const scrollViewRef = useRef<ScrollView>(null);

    const customMonthNames = [
        'Январь',
        'Февраль',
        'Март',
        'Апрель',
        'Май',
        'Июнь',
        'Июль',
        'Август',
        'Сентябрь',
        'Октябрь',
        'Ноябрь',
        'Декабрь',
    ];

    // Генерация месяцев для указанного года
    const months = eachMonthOfInterval({
        start: startOfYear(new Date(year, 0, 1)),
        end: endOfYear(new Date(year, 11, 31)),
    });

    // Добавляем пустые элементы в начало и конец списка месяцев
    const paddedMonths = [null, null, ...months, null, null];

    // Ширина выделенного элемента
    const selectedMonthWidth = 140;

    // Ширина экрана
    const screenWidth = Dimensions.get('window').width;

    // Ширина остальных элементов
    const otherMonthWidth = (screenWidth - selectedMonthWidth) / 2;

    // Функция для центрирования выбранного месяца
    const handleMonthPress = (date: Date | null, index: number) => {
        if (!date) return; // Игнорируем пустые элементы
        setSelectedDate(date);
        const offset = index * otherMonthWidth - screenWidth / 2 + selectedMonthWidth / 2; // Центрируем выбранный месяц
        scrollViewRef.current?.scrollTo({ x: offset, animated: true });

        // Вызываем callback с выбранным годом и месяцем
        if (onMonthChange) {
            onMonthChange(getYear(date), getMonth(date) + 1); // Передаем год и месяц (месяц + 1, так как getMonth возвращает 0-11)
        }
    };

    // Эффект для прокрутки к выбранному месяцу при монтировании компонента
    useEffect(() => {
        const selectedIndex = paddedMonths.findIndex((date) =>
            date && isSameMonth(date, selectedDate)
        );
        if (selectedIndex !== -1) {
            const offset = selectedIndex * otherMonthWidth - screenWidth / 2 + selectedMonthWidth / 2;
            scrollViewRef.current?.scrollTo({ x: offset, animated: false });
        }
    }, [year, month]); // Зависимости от year и month

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
                snapToInterval={otherMonthWidth} // Шаг прокрутки
                decelerationRate="fast"
            >
                {paddedMonths.map((date, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.monthItem,
                            {
                                width: date && isSameMonth(date, selectedDate) ? selectedMonthWidth : otherMonthWidth,
                            },
                        ]}
                        onPress={() => handleMonthPress(date, index)}
                    >
                        {date ? (
                            <Text
                                style={[
                                    styles.monthText,
                                    isSameMonth(date, selectedDate) && styles.selectedMonthText,
                                ]}
                            >
                                {isSameMonth(date, selectedDate)
                                    ? `${customMonthNames[getMonth(date)]} ${getYear(date)}` // Месяц и год для выбранного месяца
                                    : customMonthNames[getMonth(date)]}
                            </Text>
                        ) : (
                            <Text style={styles.monthText}></Text> // Пустой текст для пустых элементов
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F9F9F9',
        height: 70, // Фиксированная высота компонента
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollViewContent: {
        alignItems: 'center',
        height: 70, // Высота контента ScrollView
    },
    monthItem: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 70, // Высота каждого элемента месяца
    },
    monthText: {
        fontSize: 15,
        color: '#8B9CB3',
        textAlign: 'center', // Текст по центру
    },
    selectedMonthText: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        backgroundColor: '#1B2B65',
        fontSize: 15,
        color: '#fff',
        fontWeight: 'bold',
        borderRadius: 17,
    },
});

export default MonthsCarousel;
