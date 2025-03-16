import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';

type CustomSwitchProps = {
    value: boolean;
    onValueChange: (value: boolean) => void;
}

const CustomSwitch = ({ value, onValueChange }:CustomSwitchProps) => {
    const translateX = useRef(new Animated.Value(value ? 24 : 0)).current;

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: value ? 24 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [value]);

    const handlePress = () => {
        const newValue = !value;
        onValueChange(newValue);
    };

    return (
        <TouchableOpacity
            style={[styles.container, value && styles.containerActive]}
            onPress={handlePress}
        >
            <Animated.View
                style={[styles.circle, { transform: [{ translateX }] }]}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 54,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#5D6377',
        justifyContent: 'center',
        padding: 3,
    },
    containerActive: {
        backgroundColor: '#FD1F9B',
    },
    circle: {
        width: 22,
        height: 22,
        borderRadius: 7,
        backgroundColor: '#fff',
    },
});

export default CustomSwitch;
