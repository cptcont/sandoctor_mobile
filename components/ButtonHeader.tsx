import { TouchableOpacity, Image, View, StyleSheet, ImageSourcePropType } from 'react-native';

type ButtonHeaderProps = {
    iconSource: ImageSourcePropType;
    size?: number;
    containerSize?: number;
    backgroundColor?: string;
    isCircle?: boolean;
    onPress?: () => void;
    marginLeft?: number;
    marginRight?: number;
};

export function ButtonHeader({
                                 iconSource,
                                 size = 24,
                                 containerSize,
                                 backgroundColor,
                                 isCircle = false,
                                 onPress,
                                 marginLeft = 0,
                                 marginRight = 0,
                             }: ButtonHeaderProps) {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.menuButton, { marginLeft, marginRight }]}>
            {isCircle ? (
                <View
                    style={[
                        styles.circleContainer,
                        { width: containerSize, height: containerSize, backgroundColor },
                    ]}
                >
                    <Image
                        source={iconSource}
                        style={{ width: size, height: size, resizeMode: 'contain' }}
                    />
                </View>
            ) : (
                <Image
                    source={iconSource}
                    style={{ width: size, height: size, resizeMode: 'contain' }}
                />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    menuButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleContainer: {
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
