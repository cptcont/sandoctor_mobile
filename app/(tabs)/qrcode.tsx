import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRScanner from "@/components/QRCodeScanner";
import { useFocusEffect } from '@react-navigation/native';

export default function QRCodeScreen() {
    const [isCameraActive, setIsCameraActive] = useState(false);
    useFocusEffect(
        useCallback(() => {
            // Активируем камеру, когда экран в фокусе
            setIsCameraActive(true);

            return () => {
                // Отключаем камеру, когда экран теряет фокус
                setIsCameraActive(false);
            };
        }, [])
    );

    return (
        <View style={styles.container}>
            {isCameraActive && (
            <QRScanner />
                )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //justifyContent: 'center',
        //alignItems: 'center',
    },
});
