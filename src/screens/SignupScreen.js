import React from 'react';
import { AsyncStorage, StyleSheet, ScrollView, Text, TextInput, View, ActivityIndicator, StatusBar } from 'react-native';
import Button from 'react-native-button';
import AppStyles from '../AppStyles';
import firebase from 'firebase';
import '@firebase/firestore';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

class SignupScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            progress: false,
            loading: true,
            fullname: 'John',
            phone: 'Smith',
            email: 'aaa@gmail.com',
            password: '123456',
        };
    }

    componentDidMount() {
        this.authSubscription = firebase.auth().onAuthStateChanged((user) => {
            this.setState({
                loading: false,
                progress: false,
            });
        });
    }

    componentWillUnmount() {
        this.authSubscription();
        if(this.usersRef) this.usersRef.update({ isOnline: false });
    }

    componentWillMount() {
      StatusBar.setHidden(true);
    }

    getCurrentLocation(geolocation) {
        return new Promise((resolve, reject) => {
            geolocation.getCurrentPosition(
                resolve,
                ({ code, message }) =>
                resolve({ coords: { latitude: "", longitude: "" } }),
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            );
        });
    }

    onRegister = () => {
        _this = this;
        this.setState({progress: true});
        const { email, password } = this.state;
        firebase.auth().createUserWithEmailAndPassword(email, password).then(async(response) => {
            const { navigation } = this.props;
            user_uid = response.user.uid;
            const { fullname, phone, email } = this.state;
            const position = await _this.getCurrentLocation(navigator.geolocation);
            const data = {
                id: user_uid,
                email: email,
                firstName: fullname,
                phone: phone,
                userID: user_uid,
                isOnline: true,
                position: {latitude: position.coords.latitude, longitude: position.coords.longitude},
                created_at: firebase.firestore.FieldValue.serverTimestamp(),
            };
            _this.usersRef = firebase.firestore().collection('users').doc(user_uid);
            _this.usersRef.set(data);
            _this.usersRef.get().then(function (user) {
                const userData = {
                    ...user.data(),
                    position: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }
                };
                // if (firebase.messaging()){
                //     const FCM = firebase.messaging();
                //     FCM.requestPermission();
                //     // gets the device's push token
                //     FCM.getToken().then(token => { 
                //         _this.usersRef.update({
                //             isOnline: true,
                //             pushToken: token
                //         });
                //         AsyncStorage.setItem('@loggedInData:value', JSON.stringify(userData));
                //         navigation.dispatch({ type: 'UPDATE_USER_DATA', user: userData });
                //         navigation.navigate('Swipe');
                //         navigation.dispatch({ type: 'Login' });
                //         _this.props.navigation.dispatch({ type: 'IS_FROM_SIGNUP', value: true });
                //         _this.setState({progress: false});
                //     });
                // } else {
                    AsyncStorage.setItem('@loggedInData:value', JSON.stringify(userData));
                    navigation.dispatch({ type: 'UPDATE_USER_DATA', user: userData });
                    navigation.navigate('Swipe');
                    navigation.dispatch({ type: 'Login' });
                    _this.props.navigation.dispatch({ type: 'IS_FROM_SIGNUP', value: true });
                    _this.setState({progress: false});
                // } 
            }).catch(function (error) {
                const { code, message } = error;
                alert(message);
                this.setState({progress: false});
            });
        }).catch((error) => {
            const { code, message } = error;
            alert(message);
            this.setState({progress: false});
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={[styles.title, styles.leftTitle]}>Create new account</Text>
                <KeyboardAwareScrollView style={{ flex: 1, width: '100%' }} >
                    <View style={styles.InputContainer}>
                        <TextInput style={styles.body} placeholder="Full Name" onChangeText={(text) => this.setState({ fullname: text })} value={this.state.fullname} underlineColorAndroid='transparent' />
                    </View>
                    <View style={styles.InputContainer}>
                        <TextInput style={styles.body} placeholder="Phone Number" onChangeText={(text) => this.setState({ phone: text })} value={this.state.phone} underlineColorAndroid='transparent' />
                    </View>
                    <View style={styles.InputContainer}>
                        <TextInput style={styles.body} placeholder="E-mail Address" onChangeText={(text) => this.setState({ email: text })} value={this.state.email} underlineColorAndroid='transparent' />
                    </View>
                    <View style={[styles.InputContainer, {marginBottom: 50}]}>
                        <TextInput style={styles.body} placeholder="Password" secureTextEntry={true} onChangeText={(text) => this.setState({ password: text })} value={this.state.password} underlineColorAndroid='transparent' />
                    </View>
                    {this.state.progress ?
                      <ActivityIndicator size="large" color={'#384c8d'} animating={true}/> :
                      <Button containerStyle={styles.facebookContainer} style={styles.facebookText} onPress={() => this.onRegister()}>Sign Up</Button>
                    }
                </KeyboardAwareScrollView>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressbarContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)"
    },
    title: {
        fontSize: AppStyles.fontSet.xlarge,
        fontWeight: 'bold',
        color: AppStyles.colorSet.mainThemeForegroundColor,
        marginTop: 20,
        marginBottom: 20,
    },
    leftTitle: {
        alignSelf: 'stretch',
        textAlign: 'left',
        marginLeft: 20
    },
    content: {
        paddingLeft: 50,
        paddingRight: 50,
        textAlign: 'center',
        fontSize: AppStyles.fontSet.middle,
        color: AppStyles.colorSet.mainThemeForegroundColor,
    },
    loginContainer: {
        width: AppStyles.sizeSet.buttonWidth,
        backgroundColor: AppStyles.colorSet.mainThemeForegroundColor,
        borderRadius: AppStyles.sizeSet.radius,
        padding: 10,
        marginTop: 30,
    },
    loginText: {
        color: AppStyles.colorSet.mainThemeBackgroundColor
    },
    placeholder: {
        color: 'red'
    },
    InputContainer: {
        width: AppStyles.sizeSet.inputWidth,
        marginTop: 30,
        borderWidth: 1,
        borderStyle: 'solid',
        alignSelf: 'center',
        borderRadius: AppStyles.sizeSet.radius,
    },
    body: {
        height: 42,
        paddingLeft: 20,
        paddingRight: 20,
        color: AppStyles.colorSet.mainTextColor
    },
    facebookContainer: {
        alignSelf: 'center',
        width: AppStyles.sizeSet.buttonWidth,
        backgroundColor: '#384c8d',
        borderRadius: AppStyles.sizeSet.radius,
        padding: 10,
    },
    facebookText: {
        color: AppStyles.colorSet.mainThemeBackgroundColor
    },
});

export default SignupScreen;
