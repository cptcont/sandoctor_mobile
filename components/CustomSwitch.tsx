import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';

type CustomSwitchProps = {
    value: boolean;
    onValueChange: (value: boolean) => void;
    size?: 'small' | 'medium' | 'large';
}

const CustomSwitch = ({ value, onValueChange, size = 'large' }: CustomSwitchProps) => {
    const getDimensions = () => {
        switch (size) {
            case 'small':
                return {
                    containerWidth: 20,
                    containerHeight: 10,
                    circleSize: 8,
                    translateDistance: 10,
                    borderRadius: 5,
                    padding: 1,
                };
            case 'medium':
                return {
                    containerWidth: 40,
                    containerHeight: 20,
                    circleSize: 16,
                    translateDistance: 18,
                    borderRadius: 6,
                    padding: 2,
                };
            case 'large':
            default:
                return {
                    containerWidth: 54,
                    containerHeight: 28,
                    circleSize: 22,
                    translateDistance: 24,
                    borderRadius: 8,
                    padding: 3,
                };
        }
    };

    const { containerWidth, containerHeight, circleSize, translateDistance, borderRadius, padding } = getDimensions();
    const translateX = useRef(new Animated.Value(value ? translateDistance : 0)).current;

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: value ? translateDistance : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [value, translateDistance]);

    const handlePress = () => {
        const newValue = !value;
        onValueChange(newValue);
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    width: containerWidth,
                    height: containerHeight,
                    borderRadius: borderRadius,
                    padding: padding,
                },
                value && styles.containerActive,
            ]}
            onPress={handlePress}
        >
            <Animated.View
                style={[
                    styles.circle,
                    {
                        width: circleSize,
                        height: circleSize,
                        borderRadius: borderRadius - 1,
                    },
                    { transform: [{ translateX }] },
                ]}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#5D6377',
        justifyContent: 'center',
    },
    containerActive: {
        backgroundColor: '#FD1F9B',
    },
    circle: {
        backgroundColor: '#fff',
    },
});

export default CustomSwitch;
