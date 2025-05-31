import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Dimensions, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { router } from "expo-router";
import { useDrawerStatus } from '@react-navigation/drawer';
import {postData} from '@/services/api';
import { Button } from '@rneui/themed';
import {CustomHeaderScreen} from "@/components/CustomHeaderScreen";

interface BarCodeScannedEvent {
    data: string;
    type: string;
    bounds: { origin: { x: number, y: number }, size: { width: number, height: number } };
    error?: string;
}

export default function QRCodeScreen() {
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [cameraKey, setCameraKey] = useState(0);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const isDrawerOpen = useDrawerStatus();
    const { width, height } = Dimensions.get('window');
    const squareSize = 200;
    const squareX = (width) / 2;
    const squareY = (height) / 2;

    useFocusEffect(
        useCallback(() => {
            setIsCameraActive(true);
            setScanned(false);
            return () => {
                setIsCameraActive(false);
            };
        }, [])
    );

    console.log('qr scanned', scanned);

    useEffect(() => {
        if (isDrawerOpen === 'closed') {
            setCameraKey((prevKey) => prevKey + 1);
            setIsCameraActive(true);
        } else {
            setIsCameraActive(false);
        }
    }, [isDrawerOpen]);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        requestPermission();
    }

    const handleBarCodeScanned = async ({ data, bounds }: BarCodeScannedEvent) => {
        if (scanned) return; // Игнорируем повторные сканирования
        setScanned(true);
        setIsCameraActive(false); // Отключаем камеру
        console.log("QRCodeScanned handleBarCodeScanned", data);

        try {
            const response = await postData(`qr`, { url: data });

            if (!response) {
                setScanned(false);
                setTimeout(() => setIsCameraActive(true), 1000); // Задержка перед включением камеры
                return;
            }

            if (response.error) {
                setErrorMessage(response.error || 'Произошла неизвестная ошибка');
                setErrorModalVisible(true);
                setScanned(false);
                setTimeout(() => setIsCameraActive(true), 1000);
                return;
            }

            if (!response.responce || !response.responce.task || !response.responce.zone || !response.responce.point) {
                setErrorMessage('Неверный формат ответа от сервера');
                setErrorModalVisible(true);
                setScanned(false);
                setTimeout(() => setIsCameraActive(true), 1000);
                return;
            }

           // console.log('Response GKGKJGHKLJGKJ LHLJHLHLHLHLKHL lkhlhjh', response);
            let statusVisible = 'view';
            if (response.responce.task_status === "2") {
                statusVisible = 'edit';
            }
            console.log('statusVisible', statusVisible);
            router.replace({
                pathname: '/checklist',
                params: {
                    id: '20',
                    idCheckList: response.responce.task,
                    typeCheckList: '3',
                    statusVisible: statusVisible,
                    tabId: response.responce.zone,
                    tabIdTMC: response.responce.point,
                },
            });
        } catch (error) {
            console.error('Error in handleBarCodeScanned:', error);
            setErrorMessage('Ошибка при обработке QR-кода');
            setErrorModalVisible(true);
            setScanned(false);
            setTimeout(() => setIsCameraActive(true), 1000);
        }
    };

    const handleCloseModal = () => {
        setErrorModalVisible(false);
        setScanned(false);
        setTimeout(() => setIsCameraActive(true), 1000);
        router.push('/');
    };

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    const handleBack = async () => {
        router.back()
    };

    return (
        <View style={styles.container}>
            <CustomHeaderScreen onPress={handleBack} text={`Сканирование QR`} />

            {isCameraActive && (
                <CameraView
                    key={`${facing}-${cameraKey}`}
                    style={styles.camera}
                    facing={facing}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                >
                    <View style={styles.overlay}>
                        <View style={styles.square} />
                    </View>
                </CameraView>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={errorModalVisible}
                onRequestClose={() => setErrorModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>{errorMessage}</Text>
                        <Button
                            title="Закрыть"
                            titleStyle={styles.buttonTitleStyles}
                            buttonStyle={styles.button}
                            onPress={handleCloseModal}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    square: {
        width: 200,
        height: 200,
        borderWidth: 2,
        borderColor: 'white',
        backgroundColor: 'transparent',
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    button: {
        width: 120,
        borderRadius: 6,
        backgroundColor: '#017EFA',
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    buttonTitleStyles: {
        fontSize: 16,
        fontWeight: '700',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: '80%',
    },
    modalText: {
        fontSize: 16,
        marginBottom: 30,
        textAlign: 'center',
    },
});
