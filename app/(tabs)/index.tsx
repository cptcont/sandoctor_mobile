import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getYear, getMonth, getDate, format } from 'date-fns';
import MonthsCarousel from "@/components/MonthsCarousel";
import Calendar from "@/components/Calendar";
import Card from "@/components/Card";
import Footer from "@/components/Footer";
import FooterContentIcons from "@/components/FooterContentIcons";
import { useApi } from '@/context/ApiContext'; // Используем новый контекст
import { router } from "expo-router";
import type { Task } from '@/types/Task';
import { fetchDataSaveStorage, getDataFromStorage, removeDataFromStorage, saveDataToStorage } from '@/services/api'
import type { Checklist } from "@/types/Checklist";

export default function HomeScreen() {
    const currentDate = new Date(); // Текущая дата
    const [selectedYear, setSelectedYear] = useState<number>(getYear(currentDate)); // Текущий год
    const [selectedMonth, setSelectedMonth] = useState<number>(getMonth(currentDate) + 1); // Текущий месяц (getMonth возвращает 0-11)
    const [selectedDay, setSelectedDay] = useState<number>(getDate(currentDate)); // Текущий день
    const [selectedDate, setSelectedDate] = useState<string>(format(currentDate, 'yyyy-MM-dd')); // Выбранная дата в формате 'yyyy-MM-dd'
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
                // Если savedDate отсутствует или некорректен, устанавливаем текущую дату
                const currentDate = new Date();
                setSelectedYear(getYear(currentDate));
                setSelectedMonth(getMonth(currentDate) + 1);
                setSelectedDay(getDate(currentDate));
                setSelectedDate(format(currentDate, 'yyyy-MM-dd'));
            };
            loadSavedDate();
            loadTasks();
        }, [])
    );

    const handleMonthChange = async (year: number, month: number) => {
        const currentDate = new Date();
        const currentYear = getYear(currentDate);
        const currentMonth = getMonth(currentDate) + 1; // getMonth возвращает 0-11

        let day = 1; // По умолчанию устанавливаем первое число

        // Если выбранный месяц и год совпадают с текущими
        if (year === currentYear && month === currentMonth) {
            day = getDate(currentDate); // Устанавливаем текущий день
        }


            // Проверяем, есть ли сохраненная дата в хранилище
            const savedDate = await getDataFromStorage('selectedDate');
            if (typeof savedDate === 'string' || typeof savedDate === 'number' || savedDate instanceof Date) {
                const date = new Date(savedDate);
                if (!isNaN(date.getTime())) {
                    const savedYear = getYear(date);
                    const savedMonth = getMonth(date) + 1;

                    // Если месяц и год в хранилище совпадают с текущими
                    if (savedYear === currentYear && savedMonth === currentMonth) {
                        day = getDate(date); // Устанавливаем день из хранилища
                    }
                    if (savedYear === year && savedMonth === month) {
                        day = getDate(date); // Устанавливаем день из хранилища
                    }


                }
            }


        const newDate = new Date(year, month - 1, day); // month - 1, так как месяцы в JavaScript начинаются с 0
        setSelectedYear(year);
        setSelectedMonth(month);
        setSelectedDay(day);
        setSelectedDate(format(newDate, 'yyyy-MM-dd'));
    };

    const handleDaySelect = (day: number) => {
        const newDate = new Date(selectedYear, selectedMonth - 1, day);
        setSelectedDay(day);
        setSelectedDate(format(newDate, 'yyyy-MM-dd'));
        saveDataToStorage('selectedDate', newDate.toISOString()); // Сохраняем дату в формате ISO
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

    const handleOnPressCard = async (task: any) => {
        console.log('taskId', task.id);
        await fetchDataSaveStorage<Checklist>(`checklist/${task.id}`, 'checklists');
        await fetchDataSaveStorage<Task>(`task/${task.id}`, 'task');
        //removeDataFromStorage('TaskId')
        //saveDataToStorage('TaskId', task.id);
        router.push({
            pathname: '/details',
            params: {
                taskId: task.id,
            },
        });
    };

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.containerMonthsCarousel}>
                    <MonthsCarousel month={selectedMonth} onMonthChange={handleMonthChange} />
                </View>
                <Calendar
                    year={selectedYear}
                    month={selectedMonth}
                    day={selectedDay}
                    tasks={formattedTasks}
                    onDaySelect={handleDaySelect}
                />
                <ScrollView style={{ width: '100%', paddingHorizontal: 12 }}>
                    {filteredTasks.map((task, index) => (
                        <Card
                            key={index}
                            title={task.point}
                            colorStyle={task.condition.color}
                            time={`${task.time_begin_work} - ${task.time_end_work}`}
                            onPress={() => handleOnPressCard(task)}
                        />
                    ))}
                </ScrollView>
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
    },
    containerMonthsCarousel: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E3E3E3',
    },
});
