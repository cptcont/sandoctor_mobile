import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import moment from 'moment';
import 'moment/locale/ru'; // Для русской локализации

moment.locale('ru');

interface DaysCarouselProps {
    month?: number; // Месяц (1-12)
    year?: number; // Год (например, 2023)
    day?: number; // День (1-31)
}

const DaysCarousel: React.FC<DaysCarouselProps> = ({ month, year, day }) => {
    // Устанавливаем текущую дату по умолчанию, если входные данные не предоставлены
    const currentDate = moment();
    const initialDate = moment({
        year: year || currentDate.year(),
        month: (month ? month - 1 : currentDate.month()), // Месяц в moment начинается с 0
        date: day || currentDate.date(),
    });

    const [selectedDate, setSelectedDate] = useState(initialDate); // Выбранная дата
    const scrollViewRef = useRef<ScrollView>(null);

    // Обновляем selectedDate при изменении входных данных
    useEffect(() => {
        const newDate = moment({
            year: year || currentDate.year(),
            month: (month ? month - 1 : currentDate.month()),
            date: day || currentDate.date(),
        });
        setSelectedDate(newDate);
    }, [day, month, year]); // Зависимости от day, month и year

    // Генерация дней месяца
    const daysInMonth = Array.from({ length: selectedDate.daysInMonth() }, (_, i) =>
        moment(selectedDate).date(i + 1)
    );

    // Ширина экрана
    const screenWidth = Dimensions.get('window').width;

    // Ширина каждого дня
    const dayWidth = screenWidth / 7;

    // Добавляем пустые элементы в начало и конец списка дней для центрирования
    const paddingDays = Array(Math.ceil(3)).fill(null); // Добавляем 3 пустых элемента для центрирования
    const paddedDays = [...paddingDays, ...daysInMonth, ...paddingDays];

    // Функция для центрирования выбранного дня
    const handleDayPress = (date: null | moment.Moment, index: number) => {
        if (!date) return; // Игнорируем пустые элементы
        setSelectedDate(date);
        const offset = index * dayWidth - screenWidth / 2 + dayWidth / 2; // Центрируем выбранный день
        scrollViewRef.current?.scrollTo({ x: offset, animated: true });
    };

    // Получаем дни недели для указанного месяца
    const weekDays = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

    // Эффект для прокрутки к выбранному дню при монтировании компонента
    useEffect(() => {
        const selectedIndex = paddedDays.findIndex((date) =>
            date && date.isSame(selectedDate, 'day')
        );
        if (selectedIndex !== -1) {
            const offset = selectedIndex * dayWidth - screenWidth / 2 + dayWidth / 2;
            scrollViewRef.current?.scrollTo({ x: offset, animated: false });
        }
    }, [selectedDate]); // Зависимость от selectedDate

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
                snapToInterval={dayWidth} // Шаг прокрутки
                decelerationRate="fast"
            >
                {paddedDays.map((date, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.dayContainer,
                            {
                                width: dayWidth,
                            },
                            date && date.isSame(selectedDate, 'day') && styles.selectedDayContainer, // Стиль для выделенного элемента
                        ]}
                        onPress={() => handleDayPress(date, index)}
                    >
                        {date ? (
                            <>
                                <Text
                                    style={[
                                        styles.dayText,
                                        date.isSame(selectedDate, 'day') && styles.selectedDayText,
                                    ]}
                                >
                                    {date.format('D')}
                                </Text>
                                <Text
                                    style={[
                                        styles.weekDayText,
                                        date.isSame(selectedDate, 'day') && styles.selectedWeekDayText,
                                    ]}
                                >
                                    {weekDays[date.weekday() % 7]}
                                </Text>
                            </>
                        ) : (
                            <Text style={styles.dayText}></Text> // Пустой текст для пустых элементов
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 64, // Увеличиваем высоту компонента для отображения дней недели
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollViewContent: {
        alignItems: 'center',
        height: 63, // Увеличиваем высоту контента ScrollView
    },
    dayContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 70, // Высота каждого элемента дня
    },
    dayText: {
        fontSize: 18,
        color: '#000',
        textAlign: 'center',
        fontWeight: '500',
    },
    weekDayText: {
        fontSize: 16,
        color: '#8B9CB3',
    },
    selectedDayContainer: {
        width: 53,
        height: 53,
        backgroundColor: '#F0F5FF',
        borderRadius: 16,
        paddingHorizontal: 10,
    },
    selectedDayText: {
        color: '#1541C7',
        fontWeight: 'bold',
    },
    selectedWeekDayText: {
        color: '#1541C7',
    },
});

export default DaysCarousel;
