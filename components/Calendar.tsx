import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import moment from 'moment';
import { useRouter } from 'expo-router'; // Импортируем useRouter из Expo Router

interface CalendarProps {
    day?: number;
    month?: number;
    year?: number;
}

const Calendar: React.FC<CalendarProps> = ({ day, month, year }) => {
    const router = useRouter(); // Хук для навигации
    const currentDate = moment();

    // Устанавливаем год, месяц и день на основе входных данных
    const selectedYear = year || currentDate.year(); // Если год не задан, используем текущий год
    const selectedMonth = month || currentDate.month() + 1; // Если месяц не задан, используем текущий месяц

    // Устанавливаем день:
    // - Если день задан, используем его.
    // - Если день не задан, используем текущий день.
    const initialDay = day !== undefined ? day : currentDate.date();

    const [selectedDay, setSelectedDay] = useState(initialDay); // Устанавливаем начальный день
    const lastClickTime = useRef(0); // Время последнего клика

    // Обновляем selectedDay при изменении входных данных
    useEffect(() => {
        if (day !== undefined) {
            setSelectedDay(day); // Если день передан, обновляем selectedDay
        } else {
            setSelectedDay(currentDate.date()); // Если день не передан, используем текущий день
        }
    }, [day, month, year]); // Зависимости от day, month, year

    const firstDayOfMonth = moment(`${selectedYear}-${selectedMonth}-01`, 'YYYY-MM-DD');
    const lastDayOfMonth = moment(firstDayOfMonth).endOf('month');
    const startWeekday = firstDayOfMonth.isoWeekday();

    const daysFromPrevMonth = startWeekday - 1;
    const prevMonthLastDay = moment(firstDayOfMonth).subtract(1, 'month').endOf('month');
    const prevMonthDays = Array.from({ length: daysFromPrevMonth }, (_, i) =>
        prevMonthLastDay.date() - daysFromPrevMonth + i + 1
    );

    const totalDays = prevMonthDays.length + lastDayOfMonth.date();
    const daysFromNextMonth = 7 - (totalDays % 7 || 7);
    const nextMonthDays = Array.from({ length: daysFromNextMonth }, (_, i) => i + 1);

    const allDays = [
        ...prevMonthDays.map((day) => ({ day, isCurrentMonth: false })),
        ...Array.from({ length: lastDayOfMonth.date() }, (_, i) => ({
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
            // Переход на страницу details с передачей данных
            router.push({
                pathname: '/daydetails',
                params: { day, month: selectedMonth, year: selectedYear },
            });
        }

        lastClickTime.current = currentTime; // Обновляем время последнего клика
        setSelectedDay(day);
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
                            day === currentDate.date() &&
                            selectedMonth === currentDate.month() + 1 &&
                            selectedYear === currentDate.year();

                        // Проверяем, является ли день выбранным
                        const isSelectedDay = isCurrentMonth && day === selectedDay;

                        return (
                            <TouchableOpacity
                                key={dayIndex}
                                style={styles.dayContainer}
                                onPress={() => handleDayPress(day, isCurrentMonth)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.day,
                                        !isCurrentMonth && styles.otherMonthDay,
                                        isCurrentDay && styles.currentDay, // Стиль для текущего дня
                                        isSelectedDay && styles.selectedDay, // Стиль для выбранного дня
                                    ]}
                                >
                                    {day}
                                </Text>
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
        aspectRatio: 1,
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
    selectedDay: {
        backgroundColor: '#F0F5FF',
        color: '#1541C7',
        borderRadius: 50,
        width: 35,
        height: 35,
        textAlign: 'center',
        lineHeight: 33,
    },
});

export default Calendar;
