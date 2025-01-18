import { DrawerContentScrollView, DrawerItem, useDrawerStatus } from '@react-navigation/drawer';
import { View, Image, StyleSheet } from 'react-native';
import { ButtonHeader } from '@/components/ButtonHeader';

function CustomDrawerContent(props: any) {
    const isDrawerOpen = useDrawerStatus() === 'open';
    return (
        <View style={styles.container}>
            {isDrawerOpen && (
                <View style={styles.burgerMenuContainer}>
                    <ButtonHeader
                        iconSource={require('@/assets/icons/burger-cicle.png')}
                        size={47}
                        onPress={() => props.navigation.toggleDrawer()}
                        containerSize={47}
                        backgroundColor="#081A51"
                        isCircle={false}
                    />
                </View>
            )}
            <DrawerContentScrollView
                {...props}
                contentContainerStyle={styles.drawerContainer}
            >
                <View style={styles.logoContainer}>
                    <Image
                        source={require('@/assets/images/logo.png')}
                        style={styles.logo}
                    />
                </View>

                <DrawerItem
                    label="Объекты"
                    onPress={() => props.navigation.navigate('objects')}
                    icon={({ size }) => (
                        <Image
                            source={require('@/assets/icons/landmark-solid.png')}
                            style={{ width: size, height: size, tintColor: '#51CBFF' }}
                        />
                    )}
                    labelStyle={styles.drawerLabel}
                />
                <DrawerItem
                    label="Здания"
                    onPress={() => props.navigation.navigate('buildings')}
                    icon={({ size }) => (
                        <Image
                            source={require('@/assets/icons/clipboard-solid.png')}
                            style={{ width: size, height: size, tintColor: '#51CBFF' }}
                        />
                    )}
                    labelStyle={styles.drawerLabel}
                />
                <DrawerItem
                    label="QR-код"
                    onPress={() => props.navigation.navigate('qrcode')}
                    icon={({ size }) => (
                        <Image
                            source={require('@/assets/icons/triangle-exclamation-solid.png')}
                            style={{ width: size, height: size, tintColor: '#51CBFF' }}
                        />
                    )}
                    labelStyle={styles.drawerLabel}
                />

                <View style={styles.bottomLogoContainer}>
                    <Image
                        source={require('@/assets/icons/LogoHACCP.png')}
                        style={styles.bottomLogo}
                    />
                </View>
            </DrawerContentScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    burgerMenuContainer: {
        position: 'absolute',
        top: 43,
        right: -21.5,
        zIndex: 1,
    },
    drawerContainer: {
        flex: 1,
        backgroundColor: '#081A51',
    },
    logoContainer: {
        paddingTop: 54,
        paddingBottom: 57,
        alignItems: 'center',
    },
    logo: {
        resizeMode: 'contain',
    },
    drawerLabel: {
        color: 'white',
        fontSize: 14,
    },
    bottomLogoContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 15,
    },
    bottomLogo: {
        resizeMode: 'contain',
        width: 160,
        height: 60,
    },
});

export default CustomDrawerContent;
