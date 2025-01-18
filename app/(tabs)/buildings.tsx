import { View, Text, StyleSheet } from 'react-native';

export default function BuildingsScreen() {
    return (
        <View style={styles.container}>
            <Text>Здания</Text>
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
