import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
type IconProps = {
    width?: number | string;
    height?: number | string;
};

type ButtonHeaderProps = {
    icon: React.ReactElement<IconProps>;
    size?: number;
    containerSize?: number;
    onPress?: () => void;
    marginLeft?: number;
    marginRight?: number;
    backgroundColor?: string;
};

export function IconButton({
                               icon,
                               size = 30,
                               containerSize = size + 2, // Размер контейнера по умолчанию (иконка + отступы)
                               onPress,
                               marginLeft = 0,
                               marginRight = 0,
                               backgroundColor = '#F5F7FB',
                           }: ButtonHeaderProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.Button, { marginLeft, marginRight }]}
        >
            <View
                style={[
                    styles.buttonCircle,
                    {
                        width: containerSize,
                        height: containerSize,
                        borderRadius: containerSize / 2,
                        backgroundColor: backgroundColor,
                    },
                ]}
            >
                {React.cloneElement(icon as React.ReactElement<{ size?: number }>, {
                    size,
                })}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    Button: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonCircle: {
        justifyContent: 'center',
        alignItems: 'center',

    },
});
