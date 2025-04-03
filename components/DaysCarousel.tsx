import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import {
    getYear,
    getMonth,
    getDate,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    format,
    isSameDay,
    getDay,
} from 'date-fns';
import { ru } from 'date-fns/locale'; // Русская локализация

interface Task {
    date_begin_work?: string;
    color?: string;
    point?: string;
    time_begin_work?: string;
    time_end_work?: string;
    adress?: string;
}

interface DaysCarouselProps {
    month?: number; // Месяц (1-12)
    year?: number; // Год (например, 2023)
    day?: number; // День (1-31)
    tasks?: Task[]; // Список задач для отображения точек
    onDaySelect?: (day: number) => void; // Коллбэк для выбора дня
}

const DaysCarousel: React.FC<DaysCarouselProps> = ({ month, year, day, tasks = [], onDaySelect }) => {
    // Устанавливаем текущую дату по умолчанию, если входные данные не предоставлены
    const currentDate = new Date();
    const initialDate = new Date(
        year || getYear(currentDate),
        month ? month - 1 : getMonth(currentDate), // Месяц в JavaScript начинается с 0
        day || getDate(currentDate)
    );

    const [selectedDate, setSelectedDate] = useState(initialDate); // Выбранная дата
    const scrollViewRef = useRef<ScrollView>(null);

    // Обновляем selectedDate при изменении входных данных
    useEffect(() => {
        const newDate = new Date(
            year || getYear(currentDate),
            month ? month - 1 : getMonth(currentDate),
            day || getDate(currentDate)
        );
        setSelectedDate(newDate);
    }, [day, month, year]); // Зависимости от day, month и year

    // Генерация дней месяца
    const startOfCurrentMonth = startOfMonth(selectedDate);
    const endOfCurrentMonth = endOfMonth(selectedDate);
    const daysInMonth = eachDayOfInterval({
        start: startOfCurrentMonth,
        end: endOfCurrentMonth,
    });

    // Ширина экрана
    const screenWidth = Dimensions.get('window').width;

    // Ширина каждого дня
    const dayWidth = screenWidth / 7;

    // Добавляем пустые элементы в начало и конец списка дней для центрирования
    const paddingDays = Array(Math.ceil(3)).fill(null); // Добавляем 3 пустых элемента для центрирования
    const paddedDays = [...paddingDays, ...daysInMonth, ...paddingDays];

    // Функция для центрирования выбранного дня
    const handleDayPress = (date: Date | null, index: number) => {
        if (!date) return; // Игнорируем пустые элементы
        setSelectedDate(date);
        const offset = index * dayWidth - screenWidth / 2 + dayWidth / 2; // Центрируем выбранный день
        scrollViewRef.current?.scrollTo({ x: offset, animated: true });
        if (onDaySelect) {
            onDaySelect(getDate(date)); // Передаем выбранный день через коллбэк
        }
    };

    // Получаем дни недели для указанного месяца
    const weekDays = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']; // Воскресенье теперь на первом месте

    // Эффект для прокрутки к выбранному дню при монтировании компонента
    useEffect(() => {
        const selectedIndex = paddedDays.findIndex((date) =>
            date && isSameDay(date, selectedDate)
        );
        if (selectedIndex !== -1) {
            const offset = selectedIndex * dayWidth - screenWidth / 2 + dayWidth / 2;
            scrollViewRef.current?.scrollTo({ x: offset, animated: false });
        }
    }, [selectedDate]); // Зависимость от selectedDate

    // Функция для получения точек под датой
    const getCirclesForDate = (date: Date) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const circles = tasks
            .filter((task) => task.date_begin_work === formattedDate)
            .slice(0, 3) // Ограничиваем до 3 точек
            .map((task, index) => (
                <View
                    key={index}
                    style={[styles.circle, { backgroundColor: task.color }]}
                />
            ));
        return circles;
    };

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
                {paddedDays.map((date, index) => {
                    const circles = date ? getCirclesForDate(date) : null;

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.dayContainer,
                                {
                                    width: dayWidth,
                                },
                                date && isSameDay(date, selectedDate) && styles.selectedDayContainer, // Стиль для выделенного элемента
                            ]}
                            onPress={() => handleDayPress(date, index)}
                        >
                            {date ? (
                                <View style={styles.dayContent}>
                                    <Text
                                        style={[
                                            styles.dayText,
                                            isSameDay(date, selectedDate) && styles.selectedDayText,
                                        ]}
                                    >
                                        {format(date, 'd')}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.weekDayText,
                                            isSameDay(date, selectedDate) && styles.selectedWeekDayText,
                                        ]}
                                    >
                                        {weekDays[getDay(date)]}
                                    </Text>
                                    {circles && <View style={styles.circlesContainer}>{circles}</View>}
                                </View>
                            ) : (
                                <Text style={styles.dayText}></Text> // Пустой текст для пустых элементов
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 70, // Увеличиваем высоту для размещения точек
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollViewContent: {
        alignItems: 'center',
        height: 70, // Увеличиваем высоту контента ScrollView
        paddingHorizontal: 0, // Убираем горизонтальные отступы
    },
    dayContainer: {
        paddingTop: 5,
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: 70, // Увеличиваем высоту каждого элемента дня
        width: Dimensions.get('window').width / 7, // Ширина дня равна 1/7 экрана
    },
    dayContent: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
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
        height: 70,
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
    circlesContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute',
        bottom: -10, // Располагаем точки ниже текста
    },
    circle: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        marginHorizontal: 1,
    },
});

export default DaysCarousel;
