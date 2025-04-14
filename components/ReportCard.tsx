import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import type { Photo } from '@/types/Checklist';
import ImagePickerWithCamera from "@/components/ImagePickerWithCamera";

interface ReportCardProps {
    image: Photo[]; // Новый тип для изображений
    workingTime: string;
    time: string;
    executorComment: string;
    customerComment: string;
}

const ReportCard: React.FC<ReportCardProps> = ({
                                                   image,
                                                   workingTime,
                                                   time,
                                                   executorComment,
                                                   customerComment,
                                               }) => {
    // Количество изображений
    const imageCount = 4;

    return (
        <View style={styles.card}>
            <View style={styles.cardTitle}>
                <Text style={styles.title}>{'Отчетные документы'}</Text>
            </View>

            <View style={styles.imageContainer}>
                <ImagePickerWithCamera
                    key={`image`}
                    initialImages={image || []}
                    statusVisible={'view'}
                    paddingHorizontal={0}
                />
            </View>
            <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailTitle}>{'Время работ'}</Text>
                    <Text style={styles.value}>{workingTime}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailTitle}>{'Продолжительность'}</Text>
                    <Text style={styles.value}>{time}</Text>
                </View>
            </View>
            <View style={styles.commentContainer}>
                <Text style={styles.detailTitle}>{'Комментарий исполнителя'}</Text>
                <Text style={styles.value}>{executorComment}</Text>
            </View>
            <View style={styles.commentContainer}>
                <Text style={styles.detailTitle}>{'Пожелания клиента'}</Text>
                <Text style={styles.value}>{customerComment}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '100%',
    },
    cardTitle: {
        justifyContent: 'center',
        height: 58,
        marginBottom: 15,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#DADADA',
    },
    title: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1B2B65',
    },
    value: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1C1F37',
    },
    imageContainer: {
        paddingHorizontal: 14,
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 25,
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
    detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        marginBottom: 21,
    },
    detailTitle: {
        fontSize: 10,
        fontWeight: '500',
        color: '#939393',
    },
    detailItem: {
        flex: 1,
    },
    commentContainer: {
        paddingHorizontal: 14,
        marginBottom: 21,
    },
});

export default ReportCard;
