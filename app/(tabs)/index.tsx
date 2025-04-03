import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getYear, getMonth, getDate, format } from 'date-fns';
import MonthsCarousel from "@/components/MonthsCarousel";
import Calendar from "@/components/Calendar";
import Card from "@/components/Card";
import FooterContentIcons from "@/components/FooterContentIcons";
import { router } from "expo-router";
import type { Task } from '@/types/Task';
import { fetchDataSaveStorage, getDataFromStorage, saveDataToStorage } from '@/services/api';
import type { Checklist } from "@/types/Checklist";
import { useAuth } from "@/context/AuthContext";

export default function HomeScreen() {
    const currentDate = new Date();
    const [selectedYear, setSelectedYear] = useState<number>(getYear(currentDate));
    const [selectedMonth, setSelectedMonth] = useState<number>(getMonth(currentDate) + 1);
    const [selectedDay, setSelectedDay] = useState<number>(getDate(currentDate));
    const [selectedDate, setSelectedDate] = useState<string>(format(currentDate, 'yyyy-MM-dd'));
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { userData, logout, getUserDataStorage } = useAuth();

    console.log('Это index');

    const loadTasks = async () => {
        try {
            setIsLoading(true);
            await fetchDataSaveStorage<Task[]>('task/', 'tasks');
            setTasks(getDataFromStorage('tasks'));
        } catch (error) {
            console.error('Ошибка загрузки задач:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    useFocusEffect(
        useCallback(() => {
            const loadSavedDate = async () => {
                const savedDate = await getDataFromStorage('selectedDate');
                if (typeof savedDate === 'string' || typeof savedDate === 'number' || savedDate instanceof Date) {
                    const date = new Date(savedDate);
                    if (!isNaN(date.getTime())) {
                        setSelectedYear(getYear(date));
                        setSelectedMonth(getMonth(date) + 1);
                        setSelectedDay(getDate(date));
                        setSelectedDate(format(date, 'yyyy-MM-dd'));
                        return;
                    }
                }
                const currentDate = new Date();
                setSelectedYear(getYear(currentDate));
                setSelectedMonth(getMonth(currentDate) + 1);
                setSelectedDay(getDate(currentDate));
                setSelectedDate(format(currentDate, 'yyyy-MM-dd'));
            };
            loadSavedDate();
            loadTasks();
            console.log('index userData', userData);
        }, [])
    );

    const handleMonthChange = async (year: number, month: number) => {
        const currentDate = new Date();
        const currentYear = getYear(currentDate);
        const currentMonth = getMonth(currentDate) + 1;

        let day = 1;
        const isCurrentMonthAndYear = year === currentYear && month === currentMonth;

        const savedDate = await getDataFromStorage('selectedDate');
        let savedDay: number | null = null;
        if (savedDate && (typeof savedDate === 'string' || typeof savedDate === 'number' || savedDate instanceof Date)) {
            const date = new Date(savedDate);
            if (!isNaN(date.getTime())) {
                const savedYear = getYear(date);
                const savedMonth = getMonth(date) + 1;
                if (savedYear === year && savedMonth === month) {
                    savedDay = getDate(date);
                }
            }
        }

        if (isCurrentMonthAndYear) {
            day = getDate(currentDate);
        } else if (savedDay !== null) {
            day = savedDay;
        }

        const daysInMonth = new Date(year, month, 0).getDate();
        if (day > daysInMonth) {
            day = daysInMonth;
        }

        const newDate = new Date(year, month - 1, day);
        setSelectedYear(year);
        setSelectedMonth(month);
        setSelectedDay(day);
        setSelectedDate(format(newDate, 'yyyy-MM-dd'));
        saveDataToStorage('selectedDate', newDate.toISOString());
    };

    const handleDaySelect = (day: number) => {
        const newDate = new Date(selectedYear, selectedMonth - 1, day);
        setSelectedDay(day);
        setSelectedDate(format(newDate, 'yyyy-MM-dd'));
        saveDataToStorage('selectedDate', newDate.toISOString());
    };

    const formattedTasks = (tasks || []).map((task: Task) => ({
        id: task.id,
        date_begin_work: task.date_begin_work,
        color: task.condition.color,
        point: task.point,
        time_begin_work: task.time_begin_work,
        time_end_work: task.time_end_work,
        adress: task.adress,
    }));

    const filteredTasks = (tasks || []).filter((task: Task) => {
        if (!task.date_begin_work) return false;
        const taskDate = format(new Date(task.date_begin_work), 'yyyy-MM-dd');
        return taskDate === selectedDate;
    });

    const handleDateChange = (month: any) => {
        const currentDate = new Date();
        const currentYear = getYear(currentDate);
        setSelectedMonth(month);
        handleMonthChange(currentYear, month);
    };

    const handleOnPressCard = async (task: any) => {
        console.log('taskId', task.id);
        await fetchDataSaveStorage<Checklist>(`checklist/${task.id}`, 'checklists');
        await fetchDataSaveStorage<Task>(`task/${task.id}`, 'task');
        router.push({
            pathname: '/details',
            params: {
                taskId: task.id,
            },
        });
    };

    // Обработчики для кнопок "Сегодня" и "Завтра" на HomeScreen
    const handleTodayPress = () => {
        const today = new Date();
        setSelectedYear(getYear(today));
        setSelectedMonth(getMonth(today) + 1);
        setSelectedDay(getDate(today));
        setSelectedDate(format(today, 'yyyy-MM-dd'));
        saveDataToStorage('selectedDate', today.toISOString());
    };

    const handleTomorrowPress = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedYear(getYear(tomorrow));
        setSelectedMonth(getMonth(tomorrow) + 1);
        setSelectedDay(getDate(tomorrow));
        setSelectedDate(format(tomorrow, 'yyyy-MM-dd'));
        saveDataToStorage('selectedDate', tomorrow.toISOString());
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#017EFA" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.containerMonthsCarousel}>
                    <MonthsCarousel
                        key={selectedMonth}
                        month={selectedMonth}
                        onMonthChange={handleMonthChange}
                    />
                </View>
                <View style={styles.calendarContainer}>
                    <Calendar
                        key={selectedMonth}
                        year={selectedYear}
                        month={selectedMonth}
                        day={selectedDay}
                        tasks={formattedTasks}
                        onDaySelect={handleDaySelect}
                        onMonthChange={handleDateChange}
                    />
                </View>
                <ScrollView
                    style={styles.cardsContainer}
                    contentContainerStyle={styles.cardsContent}
                >
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map((task, index) => (
                            <Card
                                key={index}
                                title={task.point}
                                colorStyle={task.condition.color}
                                time={`${task.time_begin_work} - ${task.time_end_work}`}
                                onPress={() => handleOnPressCard(task)}
                                address={task.adress}
                            />
                        ))
                    ) : (
                        <Card
                            colorStyle={'#fff'}
                            noTasks={true}
                        />
                    )}
                </ScrollView>
            </View>
            <View style={styles.footer}>
                <FooterContentIcons onTodayPress={handleTodayPress} onTomorrowPress={handleTomorrowPress} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        alignItems: 'flex-start',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    containerMonthsCarousel: {
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E3E3E3',
    },
    calendarContainer: {
        height: "auto",
        width: '100%',
    },
    cardsContainer: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 12,
    },
    cardsContent: {
        paddingBottom: 20,
    },
    footer: {
        height: 77,
        width: '100%',
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E3E3E3',
    },
});
