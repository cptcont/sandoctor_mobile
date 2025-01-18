import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import moment from 'moment';
import MonthsCarousel from "@/components/MonthsCarousel";
import Calendar from "@/components/Calendar";
import Card from "@/components/Card";
import Footer from "@/components/Footer";
import FooterContentIcons from "@/components/FooterContentIcons";
import {data} from "@remix-run/router";
import {IconButton} from "@/components/IconButton";
import {ListIcon, TableCellsIcon} from "@/components/icons/Icons";
import {TextButton} from "@/components/TextButton"; // Импортируем Footer

export default function HomeScreen() {
    const [selectedYear, setSelectedYear] = useState<number>(moment().year());
    const [selectedMonth, setSelectedMonth] = useState<number>(moment().month() + 1);
    const [selectedDay, setSelectedDay] = useState<number>(moment().date());

    const handleMonthChange = (year: number, month: number) => {
        setSelectedYear(year);
        setSelectedMonth(month);
        if (year !== moment().year() || month !== moment().month() + 1) {
            setSelectedDay(1);
        } else {
            setSelectedDay(moment().date());
        }
    };
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.containerMonthsCarousel}>
                    <MonthsCarousel onMonthChange={handleMonthChange}/>
                </View>
                <Calendar year={selectedYear} month={selectedMonth} day={selectedDay}/>
                <View style={{ width: '100%', paddingHorizontal: 12 }}>
                    <Card title={'Пункт назначения'} colorStyle={'#30DA88'} time={'09:50 - 10:00'} />
                </View>
            </View>
            <Footer>
                <FooterContentIcons />
            </Footer>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // Занимает весь экран
        backgroundColor: '#fff',
    },
    content: {
        flex: 1, // Занимает всё доступное пространство, кроме футера
    },
    containerMonthsCarousel: {
        marginBottom: 20,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E3E3E3',
    },
});
