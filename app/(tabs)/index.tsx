import React, {useEffect, useState} from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { getYear, getMonth, getDate } from 'date-fns';
import MonthsCarousel from "@/components/MonthsCarousel";
import Calendar from "@/components/Calendar";
import Card from "@/components/Card";
import Footer from "@/components/Footer";
import FooterContentIcons from "@/components/FooterContentIcons";
import { useTask } from '@/context/TaskContext';


export default function HomeScreen() {
    const currentDate = new Date(); // Текущая дата
    const [selectedYear, setSelectedYear] = useState<number>(getYear(currentDate)); // Текущий год
    const [selectedMonth, setSelectedMonth] = useState<number>(getMonth(currentDate) + 1); // Текущий месяц (getMonth возвращает 0-11)
    const [selectedDay, setSelectedDay] = useState<number>(getDate(currentDate)); // Текущий день
    const { tasks, isLoading, error, fetchTasks } = useTask();

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleMonthChange = (year: number, month: number) => {
        setSelectedYear(year);
        setSelectedMonth(month);
        // Если выбранный год или месяц не совпадает с текущим, сбрасываем день на 1
        if (year !== getYear(currentDate) || month !== getMonth(currentDate) + 1) {
            setSelectedDay(1);
        } else {
            setSelectedDay(getDate(currentDate)); // Иначе устанавливаем текущий день
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.containerMonthsCarousel}>
                    <MonthsCarousel onMonthChange={handleMonthChange} />
                </View>
                <Calendar year={selectedYear} month={selectedMonth} day={selectedDay} />
                <ScrollView style={{ width: '100%', paddingHorizontal: 12 }}>
                    { tasks.responce.map((task, index) => (
                        <Card key={index} title={task.point} colorStyle={task.condition.color} time={`${task.time_begin_work} - ${task.time_end_work}`} />
                    ))
                    }
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
