import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { fetchData, postData } from '@/services/api';
import CustomSwitch from '@/components/CustomSwitch';
import { TextButton } from "@/components/TextButton";
import Footer from "@/components/Footer";

type ShowSelectTMCProps = {
    idChecklist?: string;
    idTMC?: string;
    onAddPress: () => void;
    onClosePress: () => void;
};

export const ShowSelectTMC: React.FC<ShowSelectTMCProps> = ({ idChecklist, idTMC, onAddPress, onClosePress }) => {
    const [TMC, setTMC] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const loadTMC = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetchData(`point_tmc/${idChecklist}/${idTMC}`);
            return response.responce || [];
        } catch (error) {
            console.error('Ошибка загрузки данных TMC:', error);
            setError('Не удалось загрузить данные');
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchTMCData = async () => {
            const data = await loadTMC();
            setTMC(data);
        };
        fetchTMCData();
    }, [idChecklist, idTMC]);

    const handleSwitchChange = (id: string, isSelected: boolean) => {
        setSelectedIds(prev =>
            isSelected
                ? [...prev, id]
                : prev.filter(selectedId => selectedId !== id)
        );
    };

    const handleAdd = async () => {
        if (selectedIds.length > 0) {
            await postData(`point_tmc/${idChecklist}/${idTMC}`, { answers: selectedIds });
            onAddPress();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.menu}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#017EFA" />
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : (
                    <ScrollView
                        showsVerticalScrollIndicator={true}
                        contentContainerStyle={styles.scrollContent}
                        style={styles.scrollView}
                    >
                        {TMC.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Нет ТМЦ по заданию или они все выбраны</Text>
                            </View>
                        ) : (
                            TMC.map((item, index) => (
                                <TouchableOpacity
                                    key={item.id || index}
                                    style={styles.menuItem}
                                    onPress={() => handleSwitchChange(item.id, !selectedIds.includes(item.id))}
                                >
                                    <Text style={styles.menuText}>{item.name || 'Без названия'}</Text>
                                    <CustomSwitch
                                        value={selectedIds.includes(item.id)}
                                        onValueChange={(value) => handleSwitchChange(item.id, value)}
                                        size="medium"
                                    />
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                )}
                <Footer>
                    <View style={styles.footerContainer}>
                        <TextButton
                            text="Выйти"
                            width={125}
                            height={40}
                            textSize={14}
                            textColor="#FFFFFF"
                            backgroundColor="#5D6377"
                            onPress={onClosePress}
                        />
                        <TextButton
                            text="Добавить"
                            width={125}
                            height={40}
                            textSize={14}
                            textColor="#FFFFFF"
                            backgroundColor="#017EFA"
                            enabled={TMC.length > 0 && selectedIds.length > 0}
                            touchable={TMC.length > 0 && selectedIds.length > 0}
                            onPress={handleAdd}
                        />
                    </View>
                </Footer>
            </View>
        </View>
    );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',

    },
    menu: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 5,
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 1, // Позволяет сжиматься, если контента много
    },
    scrollView: {
        maxHeight: height * 0.6, // Ограничение максимальной высоты для больших списков
    },
    scrollContent: {
        paddingHorizontal: 10,
        paddingTop: 15,
        paddingBottom: 20,
        minHeight: 100, // Минимальная высота для предотвращения "сжатия"
        flexGrow: 1, // Растягивается под контент
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        minHeight: 60,
        marginBottom: 15,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    menuText: {
        flex: 1,
        fontSize: 14,
        color: '#1B2B65',
        marginRight: 10,
    },
    loadingContainer: {
        minHeight: 100, // Соответствует минимальной высоте scrollContent
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        minHeight: 100, // Соответствует минимальной высоте scrollContent
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 14,
        color: '#FF0000',
        textAlign: 'center',
    },
    emptyContainer: {
        minHeight: 100, // Соответствует минимальной высоте scrollContent
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#1B2B65',
        textAlign: 'center',
    },
    footerContainer: {
        paddingHorizontal: 18,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
});
