import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';

type ButtonHeaderProps = {
    text: string;
    width?: number;
    height?: number;
    textColor?: string;
    textSize?: number;
    backgroundColor?: string;
    onPress?: () => void;
    marginLeft?: number;
    marginRight?: number;
    enabled?: boolean;
};

export function TextButton({
                               text,
                               width = 134,
                               height = 45,
                               textColor = 'white',
                               textSize = 16,
                               backgroundColor = 'white',
                               onPress,
                               marginLeft = 0,
                               marginRight = 0,
                               enabled = true,
                           }: ButtonHeaderProps) {


    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={!enabled}
            style={[styles.Button, { marginLeft, marginRight, opacity: enabled ? 1 : 0.6 }]}
        >
            <View
                style={[styles.buttonContainer, {
                    width: width,
                    height: height,
                    backgroundColor: backgroundColor,
                },
                ]}
            >
                <Text style={{ color: textColor, fontSize: textSize, fontWeight: 'bold' }}>
                    {text}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    Button: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
    },
});
