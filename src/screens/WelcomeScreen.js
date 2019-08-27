import React from 'react';
import Button from 'react-native-button';
import { Text, View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import AppStyles from '../AppStyles';

class WelcomeScreen extends React.Component {
    static navigationOptions = {
        header: null
    };

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.logo}>
                    <Image style={styles.image} source={AppStyles.iconSet.Logo}/>
                </View>
                <Text style={styles.title}>Find your soul mate</Text>
                <Text style={styles.caption}>Match and chat with people you like from your area</Text>
                <Button containerStyle={styles.loginContainer} style={styles.loginText}
                    onPress={() => this.props.navigation.navigate('Login')}>
                    Log In
                </Button>
                <Button containerStyle={styles.signupContainer} style={styles.signupText}
                    onPress={() => this.props.navigation.navigate('Signup')}>
                    Sign Up
                </Button>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 150
    },
    logo: {
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
        image: {
            width: '100%', height: '100%',
            resizeMode: 'contain'
        },
    title: {
        fontSize: AppStyles.fontSet.xlarge,
        fontWeight: 'bold',
        color: AppStyles.colorSet.mainThemeForegroundColor,
        marginBottom: 20,
        textAlign: 'center',
    },
    caption: {
        fontSize: 18,
        paddingHorizontal: 50,
        marginBottom: 20,
        textAlign: 'center',
    },
    loginContainer: {
        width: AppStyles.sizeSet.buttonWidth,
        backgroundColor: AppStyles.colorSet.mainThemeForegroundColor,
        borderRadius: AppStyles.sizeSet.radius,
        padding: 15,
        marginTop: 30,
    },
    loginText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: AppStyles.colorSet.mainThemeBackgroundColor,
    },
    signupContainer: {
        width: AppStyles.sizeSet.buttonWidth,
        backgroundColor: AppStyles.colorSet.mainThemeBackgroundColor,
        borderRadius: AppStyles.sizeSet.radius,
        padding: 15,
        borderWidth: 1,
        borderColor: AppStyles.colorSet.mainThemeForegroundColor,
        marginTop: 30,
    },
    signupText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: AppStyles.colorSet.mainThemeForegroundColor,
    },
})

export default WelcomeScreen;
