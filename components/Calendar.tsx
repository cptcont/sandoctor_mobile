import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router'; // Импортируем useRouter из Expo Router
import {
    getYear,
    getMonth,
    getDate,
    startOfMonth,
    endOfMonth,
    getISODay,
    subMonths,
    addDays,
    format,
    isSameDay,
    isSameMonth,
} from 'date-fns';


interface Task {
    date_begin_work?: string;
    color?: string;
    point?: string;
    time_begin_work?: string;
    time_end_work?: string;
    adress?: string;
}

interface CalendarProps {
    day?: number;
    month?: number;
    year?: number;
    tasks?: Task[]; // Новый пропс для задач
    onDaySelect: (day: number) => void; // Обработчик выбора дня
}

const Calendar: React.FC<CalendarProps> = ({ day, month, year, tasks = [], onDaySelect }) => {
    const router = useRouter(); // Хук для навигации
    const currentDate = new Date(); // Текущая дата

    // Устанавливаем год, месяц и день на основе входных данных
    const selectedYear = year || getYear(currentDate); // Если год не задан, используем текущий год
    const selectedMonth = month || getMonth(currentDate) + 1; // Если месяц не задан, используем текущий месяц

    // Устанавливаем день:
    // - Если день задан, используем его.
    // - Если день не задан, используем текущий день.
    const initialDay = day !== undefined ? day : getDate(currentDate);

    const [selectedDay, setSelectedDay] = useState(initialDay); // Устанавливаем начальный день
    const lastClickTime = useRef(0); // Время последнего клика

    // Обновляем selectedDay при изменении входных данных
    useEffect(() => {
        if (day !== undefined) {
            setSelectedDay(day); // Если день передан, обновляем selectedDay
        } else {
            setSelectedDay(getDate(currentDate)); // Если день не передан, используем текущий день
        }
    }, [day, month, year]); // Зависимости от day, month, year

    const firstDayOfMonth = startOfMonth(new Date(selectedYear, selectedMonth - 1, 1));
    const lastDayOfMonth = endOfMonth(firstDayOfMonth);
    const startWeekday = getISODay(firstDayOfMonth);

    const daysFromPrevMonth = startWeekday - 1;
    const prevMonthLastDay = endOfMonth(subMonths(firstDayOfMonth, 1));
    const prevMonthDays = Array.from({ length: daysFromPrevMonth }, (_, i) =>
        getDate(addDays(prevMonthLastDay, i - daysFromPrevMonth + 1))
    );

    const totalDays = prevMonthDays.length + getDate(lastDayOfMonth);
    const daysFromNextMonth = 7 - (totalDays % 7 || 7);
    const nextMonthDays = Array.from({ length: daysFromNextMonth }, (_, i) => i + 1);

    const allDays = [
        ...prevMonthDays.map((day) => ({ day, isCurrentMonth: false })),
        ...Array.from({ length: getDate(lastDayOfMonth) }, (_, i) => ({
            day: i + 1,
            isCurrentMonth: true,
        })),
        ...nextMonthDays.map((day) => ({ day, isCurrentMonth: false })),
    ];

    const weeks: { day: number; isCurrentMonth: boolean }[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
        weeks.push(allDays.slice(i, i + 7));
    }

    // Обработчик двойного клика
    const handleDayPress = (day: number, isCurrentMonth: boolean) => {
        if (!isCurrentMonth) return;

        const currentTime = new Date().getTime();
        const delta = currentTime - lastClickTime.current;

        if (delta < 300) { // Если разница между кликами меньше 300 мс
            // Форматируем выбранную дату
            const selectedDate = format(new Date(selectedYear, selectedMonth - 1, day), 'yyyy-MM-dd');

            // Находим задачу для выбранной даты
            const taskForSelectedDate = tasks.find(task => task.date_begin_work === selectedDate);
            //console.log('address', taskForSelectedDate.adress)
            // Если задача найдена, передаем её данные
            if (taskForSelectedDate) {
                router.push({
                    pathname: '/daydetails',
                    params: {
                        day,
                        month: selectedMonth,
                        year: selectedYear,
                        color: taskForSelectedDate.color,
                        point: taskForSelectedDate.point,
                        time_begin_work: taskForSelectedDate.time_begin_work,
                        time_end_work: taskForSelectedDate.time_end_work,
                        address: taskForSelectedDate.adress,
                    },
                });
            }
        }

        lastClickTime.current = currentTime; // Обновляем время последнего клика
        setSelectedDay(day);
        onDaySelect(day); // Вызываем обработчик выбора дня
    };

    // Функция для получения кружков по дате
    const getCirclesForDate = (date: Date) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const circles = tasks
            .filter(task => task.date_begin_work === formattedDate)
            .slice(0, 3) // Ограничиваем количество кружков до 3
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
            <View style={styles.header}>
                <Text style={styles.headerText}>Пн</Text>
                <Text style={styles.headerText}>Вт</Text>
                <Text style={styles.headerText}>Ср</Text>
                <Text style={styles.headerText}>Чт</Text>
                <Text style={styles.headerText}>Пт</Text>
                <Text style={styles.headerText}>Сб</Text>
                <Text style={styles.headerText}>Вс</Text>
            </View>
            {weeks.map((week, weekIndex) => (
                <View key={weekIndex} style={styles.week}>
                    {week.map(({ day, isCurrentMonth }, dayIndex) => {
                        // Проверяем, является ли день текущим днем
                        const isCurrentDay =
                            isCurrentMonth &&
                            isSameDay(new Date(selectedYear, selectedMonth - 1, day), currentDate);

                        // Проверяем, является ли день выбранным
                        const isSelectedDay = isCurrentMonth && day === selectedDay;

                        // Получаем кружки для текущей даты
                        const circles = isCurrentMonth
                            ? getCirclesForDate(new Date(selectedYear, selectedMonth - 1, day))
                            : null;

                        return (
                            <TouchableOpacity
                                key={dayIndex}
                                style={[
                                    styles.dayContainer,
                                    isSelectedDay && styles.selectedDayContainer, // Стиль для выбранного дня
                                ]}
                                onPress={() => handleDayPress(day, isCurrentMonth)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.dayContent}>
                                    <Text
                                        style={[
                                            styles.day,
                                            !isCurrentMonth && styles.otherMonthDay,
                                            isCurrentDay && styles.currentDay, // Стиль для текущего дня
                                            isSelectedDay && styles.selectedDayText, // Стиль для выбранного дня
                                        ]}
                                    >
                                        {day}
                                    </Text>
                                    {circles && <View style={styles.circlesContainer}>{circles}</View>}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}
        </View>
    );
};

const screenWidth = Dimensions.get('window').width;
const daySize = (screenWidth - 40) / 7;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontWeight: 'bold',
    },
    headerText: {
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
        fontSize: 16,
        color: '#333333',
    },
    week: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayContainer: {
        width: daySize,
        height: daySize, // Фиксированная высота для всех дней
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedDayContainer: {
        backgroundColor: '#F0F5FF', // Фон для выбранного дня
        borderRadius: 50, // Скругление углов
    },
    dayContent: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    day: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#858585',
    },
    otherMonthDay: {
        color: '#D6D6D6',
    },
    currentDay: {
        color: '#1541C7', // Цвет шрифта текущего дня
    },
    selectedDayText: {
        color: '#1541C7', // Цвет текста для выбранного дня
    },
    circlesContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute', // Абсолютное позиционирование
        bottom: -7, // Располагаем кружки внизу контейнера
    },
    circle: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        marginHorizontal: 1,
    },
});

export default Calendar;
