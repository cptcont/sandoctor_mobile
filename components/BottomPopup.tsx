import React, { useEffect, useState } from 'react';
import { Animated, Text, StyleSheet, View, TouchableOpacity } from 'react-native';

interface BottomPopupProps {
    message: string;
    color: string;
    duration: number;
    onClose: () => void;
}

const BottomPopup: React.FC<BottomPopupProps> = ({ message, color, duration, onClose }) => {
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => onClose());
        }, duration);

        return () => clearTimeout(timer);
    }, [fadeAnim, duration, onClose]);

    return (
        <Animated.View style={[styles.container, { backgroundColor: color, opacity: fadeAnim }]}>
            <Text style={styles.message}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
    },
});

export default BottomPopup;
