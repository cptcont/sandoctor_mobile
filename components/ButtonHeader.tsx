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
                        {
                            width: containerSize,
                            height: containerSize,
                            backgroundColor,
                            borderRadius: containerSize ? containerSize / 2 : 15, // Делаем идеальный круг
                        },
                    ]}
                >
                    <Image
                        source={iconSource}
                        style={{
                            width: containerSize, // Растягиваем на весь контейнер
                            height: containerSize, // Растягиваем на весь контейнер
                            borderRadius: containerSize ? containerSize / 2 : 15, // Обрезаем изображение по кругу
                        }}
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
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden', // Обрезаем всё, что выходит за границы круга
    },
});
