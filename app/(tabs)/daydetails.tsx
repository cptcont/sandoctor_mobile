import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Card from "@/components/Card";
import DaysCarousel from "@/components/DaysCarousel";
import FooterContentIcons from "@/components/FooterContentIcons";
import MonthsCarousel from "@/components/MonthsCarousel";
import React, { useCallback, useEffect, useState } from "react";
import { format, getDate, getMonth, getYear } from "date-fns";
import type { Task } from "@/types/Task";
import { fetchDataSaveStorage, getDataFromStorage, saveDataToStorage } from "@/services/api";
import { useFocusEffect } from "@react-navigation/native";
import type { Checklist } from "@/types/Checklist";

interface DayDetailsParamsType {
    day: number;
    month: number;
    year: number;
    color?: string;
    point?: string;
    time_begin_work?: string;
    time_end_work?: string;
    address?: string;
}

export default function DayDetailsScreen() {
    const params = useLocalSearchParams();
    const { upLoad } = params;

    const currentDate = new Date();
    const [selectedYear, setSelectedYear] = useState<number>(getYear(currentDate));
    const [selectedMonth, setSelectedMonth] = useState<number>(getMonth(currentDate) + 1);
    const [selectedDay, setSelectedDay] = useState<number>(getDate(currentDate));
    const [selectedDate, setSelectedDate] = useState<string>(format(currentDate, 'yyyy-MM-dd'));
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    console.log('Это DayDetailsScreen');

    const loadTasks = async () => {
        try {
            setIsLoading(true);
            const storedTasks = getDataFromStorage('tasks');
            setTasks(storedTasks || []);
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
                try {
                    const savedDate = await getDataFromStorage('selectedDate');
                    if (typeof savedDate === 'string' || typeof savedDate === 'number' || savedDate instanceof Date) {
                        const date = new Date(savedDate);
                        console.log('useFocusEffect DayDetailsScreen', date);
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
                } catch (error) {
                    console.error('Ошибка загрузки сохраненной даты:', error);
                }
            };
            loadSavedDate();
            loadTasks();
        }, [])
    );

    useEffect(() => {
        const loadDateBasedOnParams = async () => {
            try {
                setIsLoading(true);
                if (upLoad === 'upLoadToday') {
                    const today = new Date();
                    setSelectedYear(getYear(today));
                    setSelectedMonth(getMonth(today) + 1);
                    setSelectedDay(getDate(today));
                    setSelectedDate(format(today, 'yyyy-MM-dd'));
                    saveDataToStorage('selectedDate', today.toISOString());
                } else if (upLoad === 'upLoadTomorrow') {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setSelectedYear(getYear(tomorrow));
                    setSelectedMonth(getMonth(tomorrow) + 1);
                    setSelectedDay(getDate(tomorrow));
                    setSelectedDate(format(tomorrow, 'yyyy-MM-dd'));
                    saveDataToStorage('selectedDate', tomorrow.toISOString());
                } else {
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
                }
                await loadTasks();
            } catch (error) {
                console.error('Ошибка загрузки данных по параметрам:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadDateBasedOnParams();
    }, [upLoad]);

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
        router.push({
            pathname: '/details',
            params: {
                taskId: task.id,
                screenPath: '/daydetails',

            },
        });
    };

    return (
        <View style={styles.container}>
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#017EFA" />
                </View>
            ) : (
                <>
                    <View style={styles.content}>
                        <View style={styles.containerMonthsCarousel}>
                            <MonthsCarousel
                                key={selectedMonth}
                                month={selectedMonth}
                                onMonthChange={handleMonthChange}
                            />
                        </View>
                        <View style={styles.containerMonthsCarousel}>
                            <DaysCarousel
                                key={`${selectedMonth}-${selectedDay}`}
                                day={selectedDay}
                                month={selectedMonth}
                                year={selectedYear}
                                tasks={formattedTasks}
                                onDaySelect={handleDaySelect}
                            />
                        </View>
                        <ScrollView
                            style={{ width: '100%', paddingHorizontal: 12 }}
                            contentContainerStyle={{}}
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
                    <View style={[styles.footer, { justifyContent: 'center' }]}>
                        <FooterContentIcons
                            screenName={'daydetails'}
                        />
                    </View>
                </>
            )}
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
    containerMonthsCarousel: {
        marginBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#E3E3E3',
    },
    footer: {
        height: 77,
        width: '100%',
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E3E3E3',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
