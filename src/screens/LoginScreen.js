import React from 'react';
import { StyleSheet, Text, TextInput, View, ActivityIndicator, Platform, Alert, StatusBar, AsyncStorage } from 'react-native';
import Button from 'react-native-button';
import AppStyles from '../AppStyles';
import firebase from 'firebase';
import "@firebase/messaging";
import "@firebase/firestore";
import { Google , Facebook} from 'expo'; 
// import {FBLoginManager} from 'react-native-facebook-login';

class LoginScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loginProgress: false,
            facebookProgress: false,
            loading: true,
            email: 'abc@gmail.com',
            password: '123456',
        };
    }

    componentWillMount() {
      StatusBar.setHidden(true);
    }

    componentWillUnmount() {
      if(this.usersRef)
          this.usersRef.update({ isOnline: false });
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

    loginWithFb = () => {
        _this = this;
        this.setState({facebookProgress: true});
        Platform.OS == 'ios' ? null : Facebook.setLoginBehavior(Facebook.LoginBehaviors.Native);
        Facebook.logout(()=>{console.log('FaceBook LogOut')});
        Facebook.loginWithPermissions(["public_profile","email","user_friends"], function(error, data){
            if (!error) {
                const credential = firebase.auth.FacebookAuthProvider.credential(data.credentials.token);
                firebase.auth().signInWithCredential(credential)
                .then(async(response) => {
                    const isNewUser = response.additionalUserInfo.isNewUser;
                    const {first_name, last_name} = response.additionalUserInfo.profile;
                    const {uid, email, phoneNumber, photoURL} = response.user._user;
                    const position = await _this.getCurrentLocation(navigator.geolocation);
                    const { navigation } = _this.props;
                    _this.usersRef = firebase.firestore().collection('users').doc(uid);
                    if(isNewUser) {
                        const userData = {
                            id: uid,
                            email: email,
                            firstName: first_name,
                            lastName: last_name,
                            phone: phoneNumber,
                            profilePictureURL: photoURL,
                            userID: uid,
                            isOnline: true,
                            position: {latitude: position.coords.latitude, longitude: position.coords.longitude},
                            created_at: firebase.firestore.FieldValue.serverTimestamp(),
                        };
                        _this.usersRef.set(userData);
                    }
                    _this.usersRef.get().then(function (user) {
                        if (user.exists) {
                            const FCM = firebase.messaging();
                            FCM.requestPermission();
                            // gets the device's push token
                            FCM.getToken().then(token => {
                                const userData = {
                                  ...user.data(),
                                  position: {
                                    latitude: position.coords.latitude,
                                    longitude: position.coords.longitude
                                  }
                                };

                                _this.usersRef.update({
                                    isOnline: true,
                                    pushToken: token,
                                    position: {latitude: position.coords.latitude, longitude: position.coords.longitude}
                                });
                                // navigation.dispatch({ type: 'Login' });
                                AsyncStorage.setItem('@loggedInData:value', JSON.stringify(userData));
                                navigation.dispatch({ type: 'UPDATE_USER_DATA', user: userData });
                                navigation.navigate('Swipe');
                                _this.setState({facebookProgress: false});
                            });
                        } else {
                            alert("user does not exist!");
                            _this.setState({facebookProgress: false});
                        }
                        // _this.setState({loginProgress: false});
                    }).catch(function (error) {
                        const { code, message } = error;
                        alert(message);
                        _this.setState({facebookProgress: false});
                    });
                })
                .catch((error) => {
                    console.log(error);
                    _this.setState({facebookProgress: false});
                });
            } else {
                console.log("Error: ", error);
                Alert.alert("Network is disconnected");
                _this.setState({facebookProgress: false});
            }
        })
    }

    onPressLogin = () => {
        _this = this;
        this.setState({loginProgress: true});
        const { email, password } = this.state;
        firebase.auth().signInWithEmailAndPassword(email, password).then((response) => {
            const { navigation } = this.props; 
            user_uid = response.user.uid;
            this.usersRef = firebase.firestore().collection('users').doc(user_uid);
            this.usersRef.get().then(async function (user) {
                if (user.exists) {
                    const position = await _this.getCurrentLocation(navigator.geolocation);
                    const userData = {
                        ...user.data(),
                        position: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        }
                    }
                    if (firebase.messaging.isSupported()){
                        const FCM = firebase.messaging();
                        FCM.requestPermission();
                        // gets the device's push token
                        FCM.getToken().then(token => { 
                            console.log('device token==>', token);
                            _this.usersRef.update({
                                isOnline: true,
                                pushToken: token,
                                position: {latitude: position.coords.latitude, longitude: position.coords.longitude}
                            });
                            AsyncStorage.setItem('@loggedInData:value', JSON.stringify(userData));
                            navigation.dispatch({ type: 'UPDATE_USER_DATA', user: userData });
                            navigation.navigate('Swipe');
                            // navigation.dispatch({ type: 'Login' });
                            _this.setState({loginProgress: false});
                        });
                    } else {
                        _this.usersRef.update({
                            isOnline: true,
                            pushToken: null,
                            position: {latitude: position.coords.latitude, longitude: position.coords.longitude}
                        });
                        AsyncStorage.setItem('@loggedInData:value', JSON.stringify(userData));
                        navigation.dispatch({ type: 'UPDATE_USER_DATA', user: userData });
                        navigation.navigate('Swipe');
                        // navigation.dispatch({ type: 'Login' });
                        _this.setState({loginProgress: false});
                    }
                } else {
                    alert("user does not exist!");
                    _this.setState({loginProgress: false});
                }
            }).catch(function (error) {
                const { code, message } = error;
                alert(message);
                _this.setState({loginProgress: false});
            });
        }).catch((error) => {
            const { code, message } = error;
            alert(message);
            _this.setState({loginProgress: false});
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={[styles.title, styles.leftTitle]}>Sign In</Text>
                <View style={styles.InputContainer}>
                    <TextInput style={styles.body} placeholder="E-mail or phone number" onChangeText={(text) => this.setState({ email: text })} value={this.state.email} underlineColorAndroid='transparent' />
                </View>
                <View style={[styles.InputContainer, { marginBottom: 30 }]}>
                    <TextInput style={styles.body} secureTextEntry={true} placeholder="Password" onChangeText={(text) => this.setState({ password: text })} value={this.state.password} underlineColorAndroid='transparent' />
                </View>
                {this.state.loginProgress ? <ActivityIndicator size="large" color={AppStyles.colorSet.mainThemeForegroundColor} animating={true}/> :  <Button containerStyle={styles.loginContainer} style={styles.loginText} onPress={this.onPressLogin}>Log in</Button>}
                <View style={styles.orView}>
                    <Text style={styles.orText}>OR</Text>
                </View>
                {this.state.facebookProgress ? <ActivityIndicator size="large" color={'#384c8d'} animating={true}/> :  <Button containerStyle={[styles.loginContainer, {marginTop: 0, backgroundColor: '#384c8d'}]} style={styles.loginText} onPress={this.loginWithFb}>Facebook Login</Button>}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    loginProgressbarContainer: {
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
        padding: 12,
    },
    loginText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: AppStyles.colorSet.mainThemeBackgroundColor
    },
    placeholder: {
        color: 'red'
    },
    InputContainer: {
        width: '85%',
        marginTop: 30,
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: AppStyles.sizeSet.radius,
    },
    body: {
        height: 45,
        paddingLeft: 20,
        paddingRight: 20,
        color: AppStyles.colorSet.mainTextColor
    },
    orView: {
        marginTop: 50,
        marginBottom: 30
    },
    orText: {
        fontSize: 18
    }
});

export default LoginScreen;
