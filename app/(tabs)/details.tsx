import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { CustomHeaderScreen } from "@/components/CustomHeaderScreen";
import ArrivalCard from "@/components/ArrivalCard";
import Footer from "@/components/Footer";
import { TextButton } from "@/components/TextButton";
import ContactCard from "@/components/ContactCard";
import ActorsCard from "@/components/ActorsCard";
import ServiceCardContainer from "@/components/ServiceCardContainer";
import TaskCard from "@/components/TaskCard";
import ReportCard from "@/components/ReportCard";
import Tab from "@/components/Tab"; // Импортируем новый компонент

const DetailsScreen = () => {
    const [activeTab, setActiveTab] = useState('tab1');

    const renderContent = () => {
        switch (activeTab) {
            case 'tab1':
                return (
                    <View style={styles.tab1Container}>
                        <ScrollView contentContainerStyle={styles.scrollContent}>
                            <View style={{ marginBottom: 25 }}>
                                <ArrivalCard
                                    destination={'Ресторан на Ленинском'}
                                    address={'Москва, Ленинский пр-т, д.38'}
                                    route={'Из метро налево, потом направо'}
                                    arrivalDate={'20.05.2024'}
                                    arrivalTime={'с 10:00 до 12:00'}
                                />
                            </View>
                            <View style={{ marginBottom: 35 }}>
                                <ContactCard name={'Смирнов Роман'} post={'управляющий'} tel={'+7 912 88 73 421'} />
                            </View>
                            <View>
                                <ActorsCard name={'Смирнов Роман'} />
                            </View>
                        </ScrollView>
                        <Footer>
                            <TextButton
                                text={'Продолжить заполнение отчёта'}
                                type={'primary'}
                                size={302}
                            />
                        </Footer>
                    </View>
                );
            case 'tab2':
                return (
                    <View style={styles.content}>
                        <ServiceCardContainer title={'Услуга'} />
                    </View>
                );
            case 'tab3':
                return (
                    <View style={styles.tab3Container}>
                        <View style={{ marginBottom: 10 }}>
                            <TaskCard title={'Сантехнический осмотр объекта'} status={'completed'} />
                        </View>
                        <View style={{ marginBottom: 10 }}>
                            <TaskCard title={'Визуальный осмотр вредителей'} status={'completed'} />
                        </View>
                        <View style={{ marginBottom: 10 }}>
                            <TaskCard title={'Осмотр точек контроля'} status={'completed'} />
                        </View>
                    </View>
                );
            case 'tab4':
                return (
                    <View style={styles.tab4Container}>
                        <ReportCard
                            image={require('@/assets/images/example1.png')}
                            workingTime={'10:20 — 11:45'}
                            time={'11:45'}
                            executorComment={'Клиент не был готов к обработке'}
                            customerComment={'Нужно обязательно звонить перед выездом'}
                        />
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <CustomHeaderScreen text={'Задание №125478'} marginBottom={0} />
            <View style={styles.tabsContainer}>
                <Tab
                    label="Детали"
                    isActive={activeTab === 'tab1'}
                    onPress={() => setActiveTab('tab1')}
                />
                <Tab
                    label="Услуги"
                    isActive={activeTab === 'tab2'}
                    onPress={() => setActiveTab('tab2')}
                />
                <Tab
                    label="Чек-лист"
                    isActive={activeTab === 'tab3'}
                    onPress={() => setActiveTab('tab3')}
                />
                <Tab
                    label="Отчет"
                    isActive={activeTab === 'tab4'}
                    onPress={() => setActiveTab('tab4')}
                    isLast // Указываем, что это последняя вкладка
                />
            </View>

            <View style={styles.contentContainer}>
                {renderContent()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ECECEC',
    },
    contentContainer: {
        flex: 1,
    },
    tab1Container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    tab3Container: {
        paddingHorizontal: 10,
        paddingTop: 20,
    },
    tab4Container: {
        padding: 0,
    },
    scrollContent: {
        paddingTop: 14,
        paddingBottom: 20,
    },
    content: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: 10,
    },
});

export default DetailsScreen;
