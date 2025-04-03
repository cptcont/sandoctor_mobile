import React, { useCallback, useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { router } from "expo-router";
import { useDrawerStatus } from '@react-navigation/drawer';
import {
    fetchData,
    fetchDataSaveStorage,
    getDataFromStorage,
    postData,
    removeDataFromStorage,
    saveDataToStorage,
} from '@/services/api'

interface BarCodeScannedEvent {
    data: string; // Указываем, что data — это строка
    type: string; // Дополнительно можно указать тип QR-кода, если нужно
    bounds: { origin: { x: number, y: number }, size: { width: number, height: number } }; // Координаты QR-кода
}

export default function QRCodeScreen() {
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [cameraKey, setCameraKey] = useState(0); // Состояние для перезагрузки камеры

    // Используем хук useDrawerStatus для отслеживания состояния Drawer
    const isDrawerOpen = useDrawerStatus();

    const { width, height } = Dimensions.get('window');
    const squareSize = 200;
    const squareX = (width ) / 2;
    const squareY = (height ) / 2;

    useFocusEffect(
        useCallback(() => {
            // Активируем камеру, когда экран в фокусе
            setIsCameraActive(true);
            setScanned(false);
            return () => {
                // Отключаем камеру, когда экран теряет фокус
                setIsCameraActive(false);
            };
        }, [])
    );
    console.log('qr scanned', scanned);
    useEffect(() => {
        if (isDrawerOpen === 'closed') {
            // Перезагружаем камеру, когда Drawer закрывается
            setCameraKey((prevKey) => prevKey + 1);
            setIsCameraActive(true);
        } else {
            // Отключаем камеру, когда Drawer открывается
            setIsCameraActive(false);
        }
    }, [isDrawerOpen]);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        requestPermission()

    }

    const handleBarCodeScanned = async ({ data, bounds }: BarCodeScannedEvent) => {
        //const { origin: { x, y } } = bounds;

        // Проверяем, находится ли QR-код в пределах квадрата
        //if (
         //   x >= squareX && x <= squareX + squareSize &&
         //   y >= squareY && y <= squareY + squareSize
        //) {
        setScanned(true);

        console.log("QRCodeScanned handleBarCodeScanned", data);
        const response = await postData(`qr`, {url: data});
        if (!response) {
         setScanned(false);
        } else {
            console.log('Response', response.respoce);
            router.push({
                pathname: '/checklist',
                params: {
                    id: '20',
                    idCheckList: response.responce.task,
                    typeCheckList: '3',
                    statusVisible: 'edit',
                    tabId: response.responce.zone,
                    tabIdTMC: response.responce.point,
                },
            });
        }
        //}
    };

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    return (
        <View style={styles.container}>
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
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
});
