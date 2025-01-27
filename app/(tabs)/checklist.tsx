import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, useWindowDimensions, Text, Image } from 'react-native';
import { CustomHeaderScreen } from "@/components/CustomHeaderScreen";
import Footer from "@/components/Footer";
import { TextButton } from "@/components/TextButton";
import { router, useLocalSearchParams } from "expo-router";
import { NavigationState, Route, SceneMap, SceneRendererProps, TabView } from "react-native-tab-view";
import Tab from "@/components/Tab";
import Dropdown from "@/components/Dropdown";
import CustomTable from "@/components/CustomTable";
import CustomTableB from "@/components/CustomTableB";

const initialLayout = { width: Dimensions.get('window').width };

const ChecklistScreen = () => {
    const params = useLocalSearchParams();
    const { id, title } = params;

    // Состояние для управления текущим tabId
    const [tabId, setTabId] = useState(0);

    // Устанавливаем начальное значение tabId при монтировании компонента
    useEffect(() => {
        const initialTabId = parseInt(Array.isArray(id) ? id[0] : id, 10);
        setTabId(initialTabId);
    }, [id]); // Зависимость от id, чтобы обновить tabId при изменении id

    // Обработчик для кнопки "Далее"
    const handleNext = () => {
        if (tabId < 3) {
            setTabId(tabId + 1);
        }
    };

    // Обработчик для кнопки "Назад"
    const handleBack = () => {
        if (tabId > 1) {
            setTabId(tabId - 1);
        }
    };

    const handleFinish = () => {
        router.push('/details');
    };

    const items = [
        { label: 'Осмотр Водопровода', value: 'viewW' },
        { label: 'Осмотр Канализации', value: 'viewC' },
    ];
    const items1 = [
        { label: 'Древесный точильщик', value: 'viewW' },
        { label: 'Муравьи', value: 'viewC' },
        { label: 'Тараканы', value: 'viewV' },
    ];
    const items2 = [
        { label: '12 Приманочный ящик с клеевой пластиной', value: 'viewW' },
    ];

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'tab1', title: 'Кухня' },
        { key: 'tab2', title: 'Столовая' },
        { key: 'tab3', title: 'Спортивный зал' },
        { key: 'tab4', title: 'Душевая' },
        { key: 'tab5', title: 'Спальня' },
    ]);

    const imageCount = 4;

    const renderScene = SceneMap({
        tab1: () => (
            <View style={styles.tab1Container}>
                {tabId === 1 && (
                    <>
                        <View style={styles.text}>
                            <Text style={styles.title}>{'Параметр'}</Text>
                        </View>
                        <View style={{ marginBottom: 23 }}>
                            <Dropdown items={items} defaultValue={'viewW'} onSelect={() => { }} />
                        </View>
                        <View style={[styles.text, { marginBottom: 17 }]}>
                            <Text style={[styles.title, { marginBottom: 5 }]}>{'Наличие проблемы'}</Text>
                            <Text style={[styles.title, { color: '#FD1F9B' }]}>{'Да'}</Text>
                        </View>
                        <View style={[styles.text, { marginBottom: 20 }]}>
                            <Text style={[styles.title, { marginBottom: 5 }]}>{'Описание проблемы'}</Text>
                            <Text style={[styles.title, { color: '#939393', fontSize: 10 }]}>{'Здесь текстовое поле комментария как пример'}</Text>
                        </View>
                        <View>
                            <Text style={[styles.title, { marginBottom: 10 }]}>{'Фото'}</Text>
                        </View>
                        <View style={styles.imageContainer}>
                            {[...Array(imageCount)].map((_, index) => (
                                <Image
                                    key={index}
                                    source={require('@/assets/images/example1.png')}
                                    style={[
                                        styles.image,
                                        index !== imageCount - 1 && styles.imageMargin, // marginRight для всех, кроме последнего
                                    ]}
                                />
                            ))}
                        </View>
                    </>
                )}
                {tabId === 2 && (
                    <>
                        <View style={styles.text}>
                            <Text style={styles.title}>{'Вредитель'}</Text>
                        </View>
                        <View style={{ marginBottom: 23 }}>
                            <Dropdown items={items1} defaultValue={'viewW'} onSelect={() => { }} />
                        </View>
                        <View style={[styles.text, { marginBottom: 17 }]}>
                            <Text style={[styles.title, { marginBottom: 5 }]}>{'Наличие проблемы'}</Text>
                            <Text style={[styles.title, { color: '#FD1F9B' }]}>{'Да'}</Text>
                        </View>
                        <View style={[styles.text, { marginBottom: 20 }]}>
                            <Text style={[styles.title, { marginBottom: 5 }]}>{'Путь проникновения'}</Text>
                            <Text style={[styles.title, { color: '#939393', fontSize: 10 }]}>{'Здесь текстовое поле описание пути проникновения'}</Text>
                        </View>
                        <View style={[styles.text, { marginBottom: 17 }]}>
                            <Text style={[styles.title, { marginBottom: 5 }]}>{'Наличие следов'}</Text>
                            <Text style={[styles.title, { color: '#FD1F9B' }]}>{'Да'}</Text>
                        </View>
                        <View style={[styles.text, { marginBottom: 17 }]}>
                            <Text style={[styles.title, { marginBottom: 5 }]}>{'Наличие со слов персонала'}</Text>
                            <Text style={[styles.title, { color: '#FD1F9B' }]}>{'Да'}</Text>
                        </View>
                        <View style={[styles.text, { marginBottom: 20 }]}>
                            <Text style={[styles.title, { marginBottom: 5 }]}>{'Очаг вредителя'}</Text>
                            <Text style={[styles.title, { color: '#939393', fontSize: 10 }]}>{'Здесь текстовое поле описание пути проникновения'}</Text>
                        </View>
                    </>
                )}
                {tabId === 3 && (
                    <>
                        <View style={styles.text}>
                            <Text style={styles.title}>{'Точка контроля'}</Text>
                        </View>
                        <View style={{ marginBottom: 23 }}>
                            <Dropdown items={items2} defaultValue={'viewW'} onSelect={() => { }} />
                        </View>
                        <View style={[styles.text, { marginBottom: 17 }]}>
                            <Text style={[styles.title, { marginBottom: 5 }]}>{'Доступ'}</Text>
                            <Text style={[styles.title, { color: '#30DA88' }]}>{'Есть'}</Text>
                        </View>
                        <View style={[styles.text, { marginBottom: 13 }]}>
                            <Text style={[styles.title, { marginBottom: 5 }]}>{'Состояние'}</Text>
                            <Text style={[styles.title, { color: '#F7AA16'}]}>{'Нормальное'}</Text>
                        </View>
                        <View style={[styles.text, { marginBottom: 16 }]}>
                            <Text style={[styles.title, { marginBottom: 5 }]}>{'Состояние крепления'}</Text>
                            <Text style={[styles.title, { color: '#F7AA16'}]}>{'Нормальное'}</Text>
                        </View>
                        <View style={[styles.text, { marginBottom: 19 }]}>
                            <Text style={[styles.title, { marginBottom: 5 }]}>{'Наличие препаратов в ТК'}</Text>
                            <CustomTable />
                        </View>
                        <View style={[styles.text, { marginBottom: 20 }]}>
                            <Text style={[styles.title, { marginBottom: 5 }]}>{'Вредители'}</Text>
                            <CustomTableB />
                        </View>
                    </>
                )}

                <View style={{flex: 1, width: '100%'}}>
                    <Text></Text>
                </View>
                <Footer>
                    <View style={{paddingHorizontal: 12, width: '100%',flexDirection: 'row', justifyContent: 'space-between'}}>
                        <TextButton
                            text={'Назад'}
                            type={'secondary'}
                            size={125}
                            onPress={handleBack} // Обработчик для кнопки "Назад"
                        />
                        <TextButton
                            text={'Далее'}
                            type={'primary'}
                            size={125}
                            onPress={handleNext} // Обработчик для кнопки "Далее"
                        />
                    </View>
                </Footer>
            </View>
        ),
        tab2: () => (
            <View style={styles.content}>
            </View>
        ),
        tab3: () => (
            <View style={styles.tab3Container}>
            </View>
        ),
        tab4: () => (
            <View style={styles.tab4Container}>
            </View>
        ),
        tab5: () => (
            <View style={styles.tab4Container}>
            </View>
        ),
    });

    const tabsContainerRef = useRef<View>(null);
    const [tabsWidth, setTabsWidth] = useState(0); // Ширина контейнера табов
    const { width: screenWidth } = useWindowDimensions(); // Динамическая ширина экрана

    const renderTabBar = (
        props: SceneRendererProps & { navigationState: NavigationState<Route> }
    ) => {
        const needsEmptyTab = tabsWidth < screenWidth; // Нужен ли пустой таб

        return (
            <View style={styles.tabBarOuterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabBarContainer}
                >
                    <View
                        ref={tabsContainerRef}
                        onLayout={(event) => {
                            const { width } = event.nativeEvent.layout;
                            setTabsWidth(width); // Обновляем ширину контейнера табов
                        }}
                        style={styles.tabsContainer}
                    >
                        {props.navigationState.routes.map((route: Route, i: number) => {
                            const isActive = i === props.navigationState.index;
                            return (
                                <Tab
                                    key={route.key}
                                    label={route.title ?? ""}
                                    isActive={isActive}
                                    onPress={() => setIndex(i)}
                                    isLast={i === props.navigationState.routes.length - 1 && !needsEmptyTab}
                                />
                            );
                        })}
                    </View>
                    {needsEmptyTab && (
                        <View
                            style={[
                                styles.emptyTab,
                                { width: screenWidth - tabsWidth },
                            ]}
                        />
                    )}
                </ScrollView>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <CustomHeaderScreen text={`${title}`} marginBottom={0} onPress={handleFinish} />
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: screenWidth }}
                renderTabBar={renderTabBar}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    text: {
        marginBottom: 13,
    },
    title: {
        fontSize:12,
        fontWeight: 'bold',
    },
    tabBarOuterContainer: {
        height: 30, // Фиксированная высота для контейнера табов
    },
    tabBarContainer: {
        flexDirection: 'row', // Располагаем табы в строку
        backgroundColor: '#fff',
    },
    tabsContainer: {
        flexDirection: 'row',
    },
    tab1Container: {
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 14,
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
        paddingHorizontal: 10,
    },
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 6,
    },
    imageMargin: {
        marginRight: 14,
        marginBottom: 14, // marginRight для всех, кроме последнего
    },
    emptyTab: {
        height: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#ECECEC',
        borderLeftColor: '#ECECEC',
        borderLeftWidth: 1,
    },
});

export default ChecklistScreen;
