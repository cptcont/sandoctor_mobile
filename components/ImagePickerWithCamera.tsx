import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Camera, XMarkSolid } from '@/components/icons/Icons';
import {
    fetchDataSaveStorage,
    getDataFromStorage,
    postData,
    removeDataFromStorage,
    saveDataToStorage,
    uploadImage,
    addPhotoToJsonInMMKV
} from '@/services/api'

type ImageObject = {
    thumbUrl: string;
};

type ImagePickerWithCameraProps = {
    name?: string;
    taskId: string | string[];
    path?: string;
    initialImages?: ImageObject[]; // Исправленный тип

};

const ImagePickerWithCamera = ({ name = '', taskId, initialImages=[], path = `task/${taskId}` }: ImagePickerWithCameraProps) => {
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    useEffect(() => {
        if (initialImages.length > 0) {
            const initialImageUrls = initialImages.map(image => image.thumbUrl);
            setSelectedImages(initialImageUrls);
        } else {
            setSelectedImages([]);
        }

    }, []);
    useEffect(() => {
        if (initialImages.length > 0) {
            const initialImageUrls = initialImages.map(image => image.thumbUrl);
            setSelectedImages(initialImageUrls);
        }
    }, [initialImages])

    // Запрашиваем разрешение на доступ к камере и медиатеке
    const requestPermissions = async (): Promise<boolean> => {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();

        if (cameraPermission.status !== 'granted' || mediaLibraryPermission.status !== 'granted') {
            Alert.alert('Разрешение не получено', 'Пожалуйста, предоставьте доступ к камере и медиатеке.');
            return false;
        }
        return true;
    };

    // Функция для открытия камеры
    const openCamera = async (): Promise<void> => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            handleImageSelect(result.assets[0].uri);
        }
    };

    // Функция для выбора изображений из медиатеки
    const pickImageFromGallery = async (): Promise<void> => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled && result.assets) {
            result.assets.forEach((asset) => handleImageSelect(asset.uri));
        }
    };

    // Обработка выбранного изображения и отправка на сервер
    const handleImageSelect = async (uri: string): Promise<void> => {
        if (!selectedImages.includes(uri)) {
            setSelectedImages((prevImages) => [...prevImages, uri]);
            console.log('ImagePickerWithCamera.path', path);
            try {
                // Отправляем изображение на сервер
                const response = await uploadImage<{ url: string }>(path, uri);
                addPhotoToJsonInMMKV('task', response);
                console.log('Изображение успешно отправлено:', response);
            } catch (error) {
                console.error('Ошибка при отправке изображения:', error);
                // Удаляем изображение из списка, если отправка не удалась
                setSelectedImages((prevImages) => prevImages.filter((image) => image !== uri));
                Alert.alert('Ошибка', 'Не удалось отправить изображение.');
            }
        }
    };

    // Удаление изображения из списка
    const removeImage = async (uri: string): void => {
        setSelectedImages((prevImages) => prevImages.filter((image) => image !== uri));

        // Находим URL, содержащий "thumb_"
        const thumbUrls = selectedImages.filter(url => url.includes("thumb_"))[0];

        // Проверяем, что thumbUrls существует, и извлекаем имя файла
        if (thumbUrls) {
            const matchResult = thumbUrls.match(/thumb_([a-f0-9]+_[0-9]+\.jpeg)/);
            if (matchResult) {
                const fileName = matchResult[1];
                await postData(path, {
                    answers: [
                        { answer: name, value: fileName },
                    ],
                }, 'DELETE');
                console.log('ImagePickerWithCamera.removeImage', fileName, name);
            } else {
                console.error('No match found for the file name pattern.');
            }
        } else {
            console.error('No URL containing "thumb_" found.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.imageGridContainer}>
                {selectedImages.map((uri, index) => (
                    <View key={index} style={styles.imageWrapper}>
                        <Image source={{ uri }} style={styles.image} />
                        <TouchableOpacity onPress={() => removeImage(uri)} style={styles.removeButton}>
                            <XMarkSolid />
                        </TouchableOpacity>
                    </View>
                ))}
                <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
                    <Camera />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    imageGridContainer: {
        marginTop: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    imageWrapper: {
        position: 'relative',
        marginRight: 13,
        marginBottom: 13,
        overflow: 'visible',
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 6,
    },
    removeButton: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: '#F5F7FB',
        borderRadius: 15,
        width: 25,
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    cameraButton: {
        width: 60,
        height: 60,
        backgroundColor: '#F5F7FB',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 13,
    },
});

export default ImagePickerWithCamera;
