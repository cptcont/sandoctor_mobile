import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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

export default function HomeScreen() {
    const currentDate = new Date(); // Текущая дата
    const [selectedYear, setSelectedYear] = useState<number>(getYear(currentDate)); // Текущий год
    const [selectedMonth, setSelectedMonth] = useState<number>(getMonth(currentDate) + 1); // Текущий месяц (getMonth возвращает 0-11)
    const [selectedDay, setSelectedDay] = useState<number>(getDate(currentDate)); // Текущий день
    const [selectedDate, setSelectedDate] = useState<string>(format(currentDate, 'yyyy-MM-dd')); // Выбранная дата в формате 'yyyy-MM-dd'

    // Используем новый контекст
    const { tasks, fetchData } = useApi();

    const loadTasks = useCallback(async () => {
        try {
            await fetchData<Task[]>('task/', 'tasks'); // Указываем, что ожидаем массив задач и тип данных
        } catch (error) {
            console.error('Ошибка загрузки задач:', error);
        }
    }, [fetchData]);

    // Загружаем задачи при монтировании компонента
    useFocusEffect(
        useCallback(() => {
            loadTasks();
        }, [loadTasks])
    );

    const handleMonthChange = (year: number, month: number) => {
        setSelectedYear(year);
        setSelectedMonth(month);

        // Обновляем selectedDate при изменении месяца
        const newDate = new Date(year, month - 1, selectedDay); // month - 1, так как месяцы в JavaScript начинаются с 0
        setSelectedDate(format(newDate, 'yyyy-MM-dd'));

        loadTasks();

        // Если выбранный год или месяц не совпадает с текущим, сбрасываем день на 1
        if (year !== getYear(currentDate) || month !== getMonth(currentDate) + 1) {
            setSelectedDay(1);
        } else {
            setSelectedDay(getDate(currentDate)); // Иначе устанавливаем текущий день
        }
    };

    // Обработчик выбора даты
    const handleDaySelect = (day: number) => {
        setSelectedDay(day);
        const formattedDate = format(new Date(selectedYear, selectedMonth - 1, day), 'yyyy-MM-dd');
        setSelectedDate(formattedDate);
    };

    // Преобразуем задачи в нужный формат для Calendar
    const formattedTasks =
        (tasks || []).map((task: Task) => ({
            id: task.id,
            date_begin_work: task.date_begin_work,
            color: task.condition.color,
            point: task.point,
            time_begin_work: task.time_begin_work,
            time_end_work: task.time_end_work,
            adress: task.adress,
        }));

    // Фильтруем задачи по выбранной дате
    const filteredTasks = (tasks || []).filter((task: Task) => {
        // Проверяем, что task.date_begin_work существует
        if (!task.date_begin_work) return false; // Пропускаем задачи без даты
        const taskDate = format(new Date(task.date_begin_work), 'yyyy-MM-dd');
        return taskDate === selectedDate;
    });

    const handleOnPressCard = (task: any) => {
        router.push({
            pathname: '/details',
            params: {
                taskId: task.id,
            },
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.containerMonthsCarousel}>
                    <MonthsCarousel onMonthChange={handleMonthChange} />
                </View>
                <Calendar
                    year={selectedYear}
                    month={selectedMonth}
                    day={selectedDay}
                    tasks={formattedTasks} // Передаем преобразованные задачи
                    onDaySelect={handleDaySelect} // Передаем обработчик выбора дня
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
            <Footer>
                <FooterContentIcons />
            </Footer>

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
