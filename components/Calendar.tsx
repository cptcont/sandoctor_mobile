import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import {
    getYear,
    getMonth,
    getDate,
    startOfMonth,
    endOfMonth,
    getISODay,
    addMonths,
    addDays,
    format,
    isSameDay,
} from 'date-fns';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

// ... (интерфейсы остаются без изменений)

const screenWidth = Dimensions.get('window').width;
const DAY_SIZE = (screenWidth - 80) / 7; // Уменьшил padding с 80 до 40 для более компактного вида

const Calendar: React.FC<CalendarProps> = ({
                                               day,
                                               month,
                                               year,
                                               tasks = [],
                                               onDaySelect,
                                               onMonthChange,
                                           }) => {
    const router = useRouter();
    const currentDate = new Date();

    const initialYear = year || getYear(currentDate);
    const initialMonth = month !== undefined ? month - 1 : getMonth(currentDate);
    const initialDay = day !== undefined ? day : getDate(currentDate);

    const [selectedDay, setSelectedDay] = useState(initialDay);
    const [currentMonthIndex, setCurrentMonthIndex] = useState(initialMonth);
    const [currentYear, setCurrentYear] = useState(initialYear);
    const lastClickTime = useRef(0);
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        setSelectedDay(day !== undefined ? day : getDate(currentDate));
    }, [day, month, year]);

    const changeMonth = (direction: 'prev' | 'next') => {
        const newDate = addMonths(new Date(currentYear, currentMonthIndex, 1), direction === 'next' ? 1 : -1);
        const newMonth = getMonth(newDate);
        const newYear = getYear(newDate);

        Animated.timing(slideAnim, {
            toValue: direction === 'next' ? -screenWidth : screenWidth,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setCurrentMonthIndex(newMonth);
            setCurrentYear(newYear);
            onMonthChange(newMonth + 1, newYear);
            slideAnim.setValue(0);
        });
    };

    const handleGesture = ({ nativeEvent }: any) => {
        if (nativeEvent.state === State.END) {
            const { translationX } = nativeEvent;
            if (Math.abs(translationX) > 50) {
                if (translationX > 0) {
                    changeMonth('prev');
                } else {
                    changeMonth('next');
                }
            }
        }
    };

    const renderMonth = () => {
        const monthDate = new Date(currentYear, currentMonthIndex, 1);
        const monthYear = getYear(monthDate);
        const monthIndex = getMonth(monthDate);
        const firstDayOfMonth = startOfMonth(monthDate);
        const lastDayOfMonth = endOfMonth(firstDayOfMonth);
        const startWeekday = getISODay(firstDayOfMonth);

        const daysFromPrevMonth = startWeekday - 1;
        const prevMonthLastDay = endOfMonth(addMonths(firstDayOfMonth, -1));
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

        const handleDayPress = (day: number, isCurrentMonth: boolean) => {
            if (!isCurrentMonth) return;

            const currentTime = new Date().getTime();
            const delta = currentTime - lastClickTime.current;

            if (delta < 300) {
                const selectedDate = format(new Date(monthYear, monthIndex, day), 'yyyy-MM-dd');
                const taskForSelectedDate = tasks.find(task => task.date_begin_work === selectedDate);

                if (taskForSelectedDate) {
                    router.push({
                        pathname: '/daydetails',
                        params: {
                            day,
                            month: monthIndex + 1,
                            year: monthYear,
                            color: taskForSelectedDate.color,
                            point: taskForSelectedDate.point,
                            time_begin_work: taskForSelectedDate.time_begin_work,
                            time_end_work: taskForSelectedDate.time_end_work,
                            address: taskForSelectedDate.adress,
                        },
                    });
                }
            }

            lastClickTime.current = currentTime;
            setSelectedDay(day);
            onDaySelect(day);
        };

        const getCirclesForDate = (date: Date) => {
            const formattedDate = format(date, 'yyyy-MM-dd');
            return tasks
                .filter(task => task.date_begin_work === formattedDate)
                .slice(0, 3)
                .map((task, index) => (
                    <View
                        key={index}
                        style={[styles.circle, { backgroundColor: task.color }]}
                    />
                ));
        };

        return (
            <Animated.View
                style={[
                    styles.monthContainer,
                    {
                        transform: [{ translateX: slideAnim }],
                    },
                ]}
            >
                <View style={styles.header}>
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => (
                        <Text key={index} style={styles.headerText}>{day}</Text>
                    ))}
                </View>
                <View style={styles.weeksContainer}>
                    {weeks.map((week, weekIndex) => (
                        <View key={weekIndex} style={styles.week}>
                            {week.map(({ day, isCurrentMonth }, dayIndex) => {
                                const isCurrentDay =
                                    isCurrentMonth &&
                                    isSameDay(new Date(monthYear, monthIndex, day), currentDate);
                                const isSelectedDay =
                                    isCurrentMonth &&
                                    day === selectedDay &&
                                    monthIndex === currentMonthIndex;

                                const circles = isCurrentMonth
                                    ? getCirclesForDate(new Date(monthYear, monthIndex, day))
                                    : null;

                                return (
                                    <TouchableOpacity
                                        key={dayIndex}
                                        style={[
                                            styles.dayContainer,
                                            isSelectedDay && styles.selectedDayContainer,
                                        ]}
                                        onPress={() => handleDayPress(day, isCurrentMonth)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.dayContent}>
                                            <Text
                                                style={[
                                                    styles.day,
                                                    !isCurrentMonth && styles.otherMonthDay,
                                                    isCurrentDay && styles.currentDay,
                                                    isSelectedDay && styles.selectedDayText,
                                                ]}
                                            >
                                                {day}
                                            </Text>
                                            {circles && circles.length > 0 && (
                                                <View style={styles.circlesContainer}>{circles}</View>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </Animated.View>
        );
    };

    return (
        <PanGestureHandler onHandlerStateChange={handleGesture}>
            <View style={styles.container}>
                {renderMonth()}
            </View>
        </PanGestureHandler>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    monthContainer: {
        width: screenWidth,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    headerText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
    },
    weeksContainer: {
        // Контейнер для недель будет растягиваться по содержимому
    },
    week: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayContainer: {
        width: DAY_SIZE,
        aspectRatio: 1, // Сохраняем квадратную форму
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedDayContainer: {
        backgroundColor: '#F0F5FF',
        borderRadius: DAY_SIZE / 2,
    },
    dayContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    day: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#858585',
    },
    otherMonthDay: {
        color: '#D6D6D6',
    },
    currentDay: {
        color: '#1541C7',
    },
    selectedDayText: {
        color: '#1541C7',
    },
    circlesContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute',
        bottom: -7,
    },
    circle: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        marginHorizontal: 1,
    },
});

export default Calendar;
