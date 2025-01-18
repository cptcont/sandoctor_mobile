import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import moment from 'moment';
import 'moment/locale/ru'; // Для русской локализации

moment.locale('ru');

interface MonthsCarouselProps {
    year?: number; // Год (например, 2023)
    month?: number; // Месяц (1-12)
    onMonthChange?: (year: number, month: number) => void; // Callback для передачи данных
}

const MonthsCarousel: React.FC<MonthsCarouselProps> = ({
                                                           year = moment().year(),
                                                           month = moment().month() + 1,
                                                           onMonthChange
                                                       }) => {
    const [selectedDate, setSelectedDate] = useState(moment().year(year).month(month - 1)); // Устанавливаем выбранную дату
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
    const months = Array.from({ length: 12 }, (_, i) => moment().year(year).month(i));

    // Добавляем пустые элементы в начало и конец списка месяцев
    const paddedMonths = [null, null, ...months, null, null];

    // Ширина выделенного элемента
    const selectedMonthWidth = 140;

    // Ширина экрана
    const screenWidth = Dimensions.get('window').width;

    // Ширина остальных элементов
    const otherMonthWidth = (screenWidth - selectedMonthWidth) / 2;

    // Функция для центрирования выбранного месяца
    const handleMonthPress = (date: null | moment.Moment, index: number) => {
        if (!date) return; // Игнорируем пустые элементы
        setSelectedDate(date);
        const offset = index * otherMonthWidth - screenWidth / 2 + selectedMonthWidth / 2; // Центрируем выбранный месяц
        scrollViewRef.current?.scrollTo({ x: offset, animated: true });

        // Вызываем callback с выбранным годом и месяцем
        if (onMonthChange) {
            onMonthChange(date.year(), date.month() + 1); // Передаем год и месяц (месяц + 1, так как moment считает месяцы с 0)
        }
    };

    // Эффект для прокрутки к выбранному месяцу при монтировании компонента
    useEffect(() => {
        const selectedIndex = paddedMonths.findIndex((date) =>
            date && date.isSame(selectedDate, 'month')
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
                                width: date && date.isSame(selectedDate, 'month') ? selectedMonthWidth : otherMonthWidth,
                            },
                        ]}
                        onPress={() => handleMonthPress(date, index)}
                    >
                        {date ? (
                            <Text
                                style={[
                                    styles.monthText,
                                    date.isSame(selectedDate, 'month') && styles.selectedMonthText,
                                ]}
                            >
                                {date.isSame(selectedDate, 'month')
                                    ? `${customMonthNames[date.month()]} ${date.year()}` // Месяц и год для выбранного месяца
                                    : customMonthNames[date.month()]}
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
