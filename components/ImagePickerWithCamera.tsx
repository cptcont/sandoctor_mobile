import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Alert, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Camera, XMarkSolid, Gallery, CheckSolid } from '@/components/icons/Icons';
import {
    fetchDataSaveStorage,
    getDataFromStorage,
    postData,
    removeDataFromStorage,
    saveDataToStorage,
    uploadImage,
    addPhotoToJsonInMMKV
} from '@/services/api';

interface ImageObject {
    name: string;
    thumbUrl: string;
    originalUrl: string;
}

interface ImagePickerWithCameraProps {
    name?: string;
    taskId?: string | string[];
    path?: string;
    initialImages?: ImageObject[];
    onImageUploaded?: (response: { url: string; thumbUrl: string; name: string }) => void;
    onImageRemoved?: (removedImage: ImageObject) => void;
    viewGallery?: boolean;
    selected?: boolean;
}

const ImagePickerWithCamera: React.FC<ImagePickerWithCameraProps> = ({
                                                                         name = '',
                                                                         taskId,
                                                                         initialImages = [],
                                                                         path = taskId ? `task/${taskId}` : '',
                                                                         onImageUploaded,
                                                                         onImageRemoved,
                                                                         viewGallery = false,
                                                                         selected = false
                                                                     }) => {
    const [selectedImages, setSelectedImages] = useState<ImageObject[]>(initialImages);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [markedImageUrl, setMarkedImageUrl] = useState<string | null>(null);

    useEffect(() => {
        const isEqual = JSON.stringify(initialImages) === JSON.stringify(selectedImages);
        if (!isEqual) {
            setSelectedImages(initialImages.length > 0 ? initialImages : []);
        }
    }, [initialImages]);

    const requestPermissions = async (): Promise<boolean> => {
        const [cameraPermission, mediaLibraryPermission] = await Promise.all([
            ImagePicker.requestCameraPermissionsAsync(),
            MediaLibrary.requestPermissionsAsync()
        ]);

        if (cameraPermission.status !== 'granted' || mediaLibraryPermission.status !== 'granted') {
            Alert.alert('Разрешение не получено', 'Пожалуйста, предоставьте доступ к камере и медиатеке.');
            return false;
        }
        return true;
    };

    const openCamera = async (): Promise<void> => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            aspect: [1, 1] as [number, number],
            quality: 0.5,
        });

        if (!result.canceled && result.assets?.length) {
            await handleImageSelect(result.assets[0].uri);
        }
    };

    const pickImageFromGallery = async (): Promise<void> => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            aspect: [1, 1] as [number, number],
            quality: 0.5,
        });

        if (!result.canceled && result.assets) {
            await Promise.all(result.assets.map(asset => handleImageSelect(asset.uri)));
        }
    };

    const handleImageSelect = async (uri: string): Promise<void> => {
        if (selected && onImageUploaded) {
            onImageUploaded({ url: uri, thumbUrl: uri, name: '' });
            return;
        }

        try {
            const response = await uploadImage<{ url: string; thumbUrl: string; name: string }>(path, uri);
            const newImage: ImageObject = {
                name: response.name,
                thumbUrl: response.thumbUrl,
                originalUrl: response.url
            };

            setSelectedImages(prevImages => [...prevImages, newImage]);
            await addPhotoToJsonInMMKV('task', response);
            console.log('Изображение успешно отправлено:', response);

            // Уведомляем родительский компонент о добавлении изображения
            onImageUploaded?.(response);
        } catch (error) {
            console.error('Ошибка при отправке изображения:', error);
            Alert.alert('Ошибка', 'Не удалось отправить изображение.');
        }
    };

    const removeImage = async (image: ImageObject): Promise<void> => {
        setSelectedImages(prevImages => prevImages.filter(img => img.thumbUrl !== image.thumbUrl));

        const matchResult = image.thumbUrl.match(/thumb_([a-f0-9]+_[0-9]+\.jpe?g)/i);
        if (matchResult) {
            const fileName = matchResult[1];
            await postData(path, {
                answers: [
                    { answer: name, value: fileName },
                ],
            }, 'DELETE');
            console.log('ImagePickerWithCamera.removeImage', fileName, name);
        }

        // Уведомляем родительский компонент об удалении изображения
        onImageRemoved?.(image);
    };

    const openImagePreview = (image: ImageObject): void => {
        setSelectedImageUrl(image.originalUrl);
        setIsModalVisible(true);
    };

    const closeImagePreview = (): void => {
        setIsModalVisible(false);
        setSelectedImageUrl(null);
    };

    const toggleImageMark = (): void => {
        if (selectedImageUrl) {
            setMarkedImageUrl(prev => prev === selectedImageUrl ? null : selectedImageUrl);
            if (onImageUploaded && selectedImageUrl !== markedImageUrl) {
                onImageUploaded({
                    url: selectedImageUrl,
                    thumbUrl: selectedImageUrl,
                    name: ''
                });
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.imageGridContainer}>
                {selectedImages.map((image, index) => (
                    <View
                        key={`${image.thumbUrl}-${index}`}
                        style={[
                            styles.imageWrapper,
                            markedImageUrl === image.originalUrl && styles.markedImageWrapper
                        ]}
                    >
                        <TouchableOpacity onPress={() => openImagePreview(image)}>
                            <Image source={{ uri: image.thumbUrl }} style={styles.image} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => removeImage(image)} style={styles.removeButton}>
                            <XMarkSolid />
                        </TouchableOpacity>
                    </View>
                ))}
                <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
                    <Camera />
                </TouchableOpacity>
                {viewGallery && (
                    <TouchableOpacity style={[styles.cameraButton]} onPress={pickImageFromGallery}>
                        <Gallery />
                    </TouchableOpacity>
                )}
            </View>

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeImagePreview}
            >
                <View style={styles.modalContainer}>
                    {selected && (
                        <TouchableOpacity
                            style={styles.modalMarkButton}
                            onPress={toggleImageMark}
                        >
                            <CheckSolid
                                color={markedImageUrl === selectedImageUrl ? '#081A51' : '#fff'}
                            />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.modalCloseButton} onPress={closeImagePreview}>
                        <XMarkSolid color="#fff" />
                    </TouchableOpacity>
                    {selectedImageUrl && (
                        <Image
                            source={{ uri: selectedImageUrl }}
                            style={[
                                styles.fullImage,
                                markedImageUrl === selectedImageUrl && styles.markedFullImage
                            ]}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
    },
    imageGridContainer: {
        marginTop: 20,
        flexDirection: 'row' as const,
        flexWrap: 'wrap' as const,
        justifyContent: 'flex-start' as const,
    },
    imageWrapper: {
        position: 'relative' as const,
        marginRight: 13,
        marginBottom: 13,
        overflow: 'visible' as const,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 6,
    },
    removeButton: {
        position: 'absolute' as const,
        top: -10,
        right: -10,
        backgroundColor: '#F5F7FB',
        borderRadius: 15,
        width: 25,
        height: 25,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        zIndex: 100,
    },
    cameraButton: {
        width: 60,
        height: 60,
        backgroundColor: '#F5F7FB',
        borderRadius: 6,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        marginBottom: 13,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    },
    fullImage: {
        width: '90%',
        height: '80%',
    },
    modalCloseButton: {
        position: 'absolute' as const,
        top: 40,
        right: 20,
        zIndex: 100,
    },
    markedImageWrapper: {
        borderWidth: 2,
        borderColor: '#081A51',
        borderRadius: 6,
    },
    modalMarkButton: {
        position: 'absolute' as const,
        top: 40,
        left: 20,
        zIndex: 100,
    },
    markedFullImage: {
        borderWidth: 4,
        borderColor: '#081A51',
    },
});

export default ImagePickerWithCamera;
