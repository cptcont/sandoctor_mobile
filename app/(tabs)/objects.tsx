import { View, Text, StyleSheet } from 'react-native';

export default function ObjectsScreen() {
    return (
        <View style={styles.container}>
            <Text>Объекты</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
