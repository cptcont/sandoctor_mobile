import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { CustomHeaderScreen } from "@/components/CustomHeaderScreen";
import ArrivalCard from "@/components/ArrivalCard";
import Footer from "@/components/Footer";
import { TextButton } from "@/components/TextButton";
import ContactCard from "@/components/ContactCard";
import ActorsCard from "@/components/ActorsCard";
import ServiceCardContainer from "@/components/ServiceCardContainer";
import TaskCard from "@/components/TaskCard";
import ReportCard from "@/components/ReportCard";

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
                        {/* Футер только для tab1 */}
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
                        <ServiceCardContainer title={'Услуга'}
                        />
                    </View>
                );
            case 'tab3':
                return (
                    <View style={styles.tab3Container}>
                        <View style={{marginBottom: 10}}>
                            <TaskCard title={'Сантехнический осмотр объекта'} status={'completed'} />
                        </View>
                        <View style={{marginBottom: 10}}>
                            <TaskCard title={'Визуальный осмотр вредителей'} status={'completed'} />
                        </View>
                        <View style={{marginBottom: 10}}>
                            <TaskCard title={'Осмотр точек контроля'} status={'completed'} />
                        </View>
                    </View>
                );
            case 'tab4':
                return (
                    <View style={styles.tab4Container}>
                        <ReportCard image={require('@/assets/images/example1.png')}
                                    workingTime={'10:20 — 11:45'}
                                    time={'11:45'}
                                    executorComment={'Клиент не был готов к обработке'}
                                    customerComment={'Нужно обязательно звонить перед выездом'}/>
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
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'tab1' && styles.activeTab]}
                    onPress={() => setActiveTab('tab1')}
                >
                    <Text style={[styles.tabText, activeTab === 'tab1' && styles.activeTabText]}>Детали</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'tab2' && styles.activeTab]}
                    onPress={() => setActiveTab('tab2')}
                >
                    <Text style={[styles.tabText, activeTab === 'tab2' && styles.activeTabText]}>Услуги</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'tab3' && styles.activeTab]}
                    onPress={() => setActiveTab('tab3')}
                >
                    <Text style={[styles.tabText, activeTab === 'tab3' && styles.activeTabText]}>Чек-лист</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'tab4' && styles.activeTab, styles.lastTab]}
                    onPress={() => setActiveTab('tab4')}
                >
                    <Text style={[styles.tabText, activeTab === 'tab4' && styles.activeTabText]}>Отчет</Text>
                </TouchableOpacity>
            </View>

            {/* Контент для активной закладки */}
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
        borderBottomWidth: 1, // Общий нижний бордер для всех табов
        borderBottomColor: '#ECECEC',
    },
    tab: {
        justifyContent: 'center',
        width: 71,
        height: 30, // Высота неактивного таба
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#ECECEC',
        borderBottomWidth: 1, // Нижний бордер для неактивных табов
        borderBottomColor: '#ECECEC',
        borderRightWidth: 0, // Убираем правый бордер у всех табов
        backgroundColor: '#fff', // Фон таба
        marginRight: 0, // Отступ между табами
    },
    activeTab: {
        borderBottomWidth: 0, // Убираем нижний бордер для активного таба
        height: 31, // Увеличиваем высоту активного таба на 1px
        marginBottom: -1, // Сдвигаем активный таб вниз, чтобы он перекрыл общий бордер
        backgroundColor: '#fff', // Фон активного таба
    },
    lastTab: {
        borderRightWidth: 1, // Добавляем правый бордер только для последнего таба
    },
    tabText: {
        textAlign: 'center',
        fontSize: 10,
        fontWeight: '500', // Исправлено на правильное значение
        color: '#939393',
    },
    activeTabText: {
        color: '#000',
    },
    contentContainer: {
        flex: 1,
    },
    tab1Container: {
        flex: 1,
        justifyContent: 'space-between', // Распределяет пространство между контентом и футером
    },
    tab3Container: {
        paddingHorizontal: 10,
        paddingTop: 20
    },
    tab4Container: {
        padding: 0
    },
    scrollContent: {
        paddingTop: 14,
        paddingBottom: 20, // Отступ снизу для контента
    },
    content: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: 10,
    },
    contentText: {
        fontSize: 18,
        color: '#1541C7',
    },
});

export default DetailsScreen;
