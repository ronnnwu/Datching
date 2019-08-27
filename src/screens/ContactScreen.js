import React, { Component, Fragment } from 'react';
import { Platform, Text, View, ScrollView, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Linking, StatusBar } from 'react-native';
import AppStyles from '../AppStyles';
import Icon from 'react-native-vector-icons/Ionicons';
import firebase from 'firebase';
import '@firebase/firestore';
import { connect } from 'react-redux';

class ContactScreen extends React.Component {
    static navigationOptions = {
        header: null
    };

    constructor() {
        super();
        this.state = {
            // firstname: null,
            // lastname: null,
            // bio: null,
            // age: null,
            // school: null,
            // gender: null,
            // email: null,
        };
    }

    componentWillMount() {
        // const user_uid = this.props.user.userID;
        // const _this = this;
        // firebase.firestore().collection('users').doc(user_uid).get().then(function (user) {
        //     if (user.exists) {
        //         if (user.data().firstName) {_this.setState({firstname: user.data().firstName})}
        //         if (user.data().lastName) {_this.setState({lastname: user.data().lastName})}
        //         if (user.data().bio) {_this.setState({bio: user.data().bio})}
        //         if (user.data().age) {_this.setState({age: user.data().age})}
        //         if (user.data().school) {_this.setState({school: user.data().school})}
        //         if (user.data().gender) {_this.setState({gender: user.data().gender})}
        //         if (user.data().email) {_this.setState({email: user.data().email})}
        //     }
        // });
    }

    // done() {
    //     if (this.state.firstname &&
    //         this.state.lastname &&
    //         this.state.bio &&
    //         this.state.age &&
    //         this.state.school &&
    //         this.state.gender &&
    //         this.state.email)
    //     {
    //         const user_uid = this.props.user.userID;
    //         let data = {
    //             firstName: this.state.firstname,
    //             lastName: this.state.lastname,
    //             bio: this.state.bio,
    //             age: this.state.age,
    //             school: this.state.school,
    //             gender: this.state.gender,
    //             email: this.state.email,
    //         };
    //         firebase.firestore().collection('users').doc(user_uid).update(data);
    //         this.props.navigation.navigate('Swipe');
    //     } else {
    //         Alert.alert(
    //             'Please complete your profile',
    //             'Fill out all the blank fields',
    //             [
    //               {text: 'OK', onPress: () => console.log('ok')},
    //             ],
    //             { cancelable: false }
    //         );
    //     }
    // }
    back() {
        this.props.navigation.goBack();
    }

    render() {
        return (
          <Fragment>
            <StatusBar backgroundColor="white" barStyle="dark-content" />
            <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
              <View style={styles.container}>
                  <View style={styles.navbar}>
                      <TouchableOpacity style={[styles.header, {flexDirection: 'row', justifyContent: 'flex-start'}]} onPress={() => this.back()}>
                          <Icon style={styles.icon} name="ios-arrow-back" size={35} color={AppStyles.colorSet.mainThemeForegroundColor} />
                          <Text style={[styles.text, {color: AppStyles.colorSet.mainThemeForegroundColor}]}>
                              Back
                          </Text>
                      </TouchableOpacity>
                      <View style={styles.header}>
                          <Text style={styles.title}>Contact</Text>
                      </View>
                      <View style={styles.header}/>
                  </View>
                  <ScrollView style={styles.body}>
                      <View style={styles.labelView}>
                          <Text style={styles.label}>CONTACT</Text>
                      </View>
                      <View style={styles.contentView}>
                          <View style={styles.addressView}>
                              <Text style={styles.text}>Our address</Text>
                              <Text style={styles.textcaption}>1412 Steiner Street, San Francisco, CA, 94115</Text>
                          </View>
                          <View style={styles.itemView}>
                              <Text style={styles.text}>E-mail us</Text>
                              {
                                  this.state.school?
                                  <Text style={styles.text}>{this.state.school}</Text>
                                  :
                                  <Text style={styles.placeholderText}>office@idating.com ></Text>
                              }
                          </View>
                      </View>
                      <View style={styles.captionView}>
                          <Text style={styles.caption}>
                              {'Our business hours are Mon - Fri, 10am - 5pm, PST.\n'}

                          </Text>
                      </View>
                      <View style={styles.contentView}>
                          <TouchableOpacity onPress={() => Linking.openURL(`tel:${11234567890}`)} style={styles.itemButton}>
                              <Text style={[styles.text, {color: '#384c8d'}]}>Call Us</Text>
                          </TouchableOpacity>
                      </View>
                      <View style={styles.labelView}/>
                  </ScrollView>
              </View>
              </SafeAreaView>
              <SafeAreaView style={{ flex: 0, backgroundColor: '#efeff4' }} />
            </Fragment>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#efeff4'
    },
    statusbar: {
        width: '100%',
        height: Platform.OS === "ios" ? 45 : 0,
        backgroundColor: AppStyles.colorSet.mainThemeBackgroundColor,
    },
    navbar: {
        height: Platform.OS === "ios" ? 50 : 48,
        width: '100%',
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: AppStyles.colorSet.mainThemeBackgroundColor,
    },
        header: {
            flex: 0.3,
            alignItems: 'center',
            // justifyContent: 'center',
            marginTop: 5
        },
            icon: {
                marginRight: 5,
                marginLeft: 10,
            },
    body: {
        width: '100%',
    },
        labelView: {
            width: '100%', height: 60,
            padding: 10,
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
        },
        captionView: {
            width: '100%',
            padding: 10,
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
        },
        contentView: {
            width: '100%',
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: AppStyles.colorSet.hairlineColor,
            backgroundColor: AppStyles.colorSet.mainThemeBackgroundColor,
        },
            itemView: {
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 10,
            },
            addressView: {
                width: '100%',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: 10,
            },
            lineView: {
                left: 15,
                width: '95%', height: 1,
                backgroundColor: AppStyles.colorSet.hairlineColor,
            },
            itemButton: {
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 10,
            },
    title: {
        fontSize: 22,
        textAlign: 'center'
    },
    text: {
        fontSize: 20
    },
    textcaption: {
        fontSize: 14
    },
    placeholderText: {
        fontSize: 20,
        color: AppStyles.colorSet.hairlineColor,
    },
    label: {
        fontSize: 14,
        color: AppStyles.colorSet.mainTextColor,
    },
    caption: {
        fontSize: 13,
        color: AppStyles.colorSet.mainTextColor,
    },
})

const mapStateToProps = state => ({
    user: state.auth.user,
});

export default connect(mapStateToProps)(ContactScreen);
