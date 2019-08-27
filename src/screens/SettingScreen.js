import React, { Component, Fragment } from 'react';
import { Platform, Switch, Text, View, ScrollView, TouchableOpacity, StyleSheet, Alert, StatusBar, SafeAreaView } from 'react-native';
import AppStyles from '../AppStyles';
import Icon from 'react-native-vector-icons/Ionicons';
import firebase from 'firebase';
import '@firebase/firestore';
import { connect } from 'react-redux';

class SettingScreen extends Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
          distanceData: ["5 miles", "10 miles", "20 miles", "50 miles"],
          genderData: ["Male", "Female", "Don't show"],
        };
        this.userId = this.props.navigation.getParam('userId');
        this.userRef = firebase.firestore().collection('users').doc(this.userId);
    }

    componentWillMount() {
      StatusBar.setHidden(false);
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

    updateUserData = (data) => {
      this.userRef.collection('settings').doc(data.type)
        .set(data)
        .then(() => {
          console.log('data successfully saved!');
        })
        // .then(() => {
        //   if (data.type = "GENDER") {
        //     this.userRef.update({
        //       gender: this.state.genderData[data.index]
        //     });
        //   }
        // })
        .catch(function(error) {
          console.log(error);
        });
    }

    onPress = (optionData, index, option) => {
      if (optionData === this.state.distanceData) {
        const value = {
          type: 'MAXIMUM_DISTANCE',
          selectedDistanceIndex: index,
          maximumDistance: option,
          value: index
        };

        this.updateUserData(value);
        this.props.navigation.dispatch({ type: 'MAXIMUM_DISTANCE', value: index })
      }

      if (optionData === this.state.genderData) {
        const value = {
          type: 'GENDER',
          selectedGenderIndex: index,
          gender: option,
          value: index
        };

        this.updateUserData(value);
        this.props.navigation.dispatch({ type: 'GENDER', value: index })
      }
    };

    onSwitchToggle = (value, type) => {
      const item = {
        type,
        value
      };

      this.updateUserData(item);
      this.props.navigation.dispatch({ type, value })
    }

    renderOption = (option, index, optionData, selectedColor) => {
      return (
        <TouchableOpacity
          key={index}
          onPress={() => this.onPress(optionData, index, option)}
          >
          <View style={styles.itemView}>
              <Text style={[styles.text, selectedColor]}>
                {option}
              </Text>
          </View>
          {index !== optionData.length - 1 && (
            <View style={styles.lineView}/>
          )}
        </TouchableOpacity>
      )
    }

    render() {
        return (
          <Fragment>
            <StatusBar backgroundColor="white" barStyle="dark-content" />
            <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
              <View style={styles.container}>
                  <View style={styles.navbar}>
                      <TouchableOpacity style={[styles.header, {flexDirection: 'row', justifyContent: 'flex-start'}]} onPress={() => this.back()}>
                          <Icon style={styles.icon} name="ios-arrow-back" size={30} color={AppStyles.colorSet.mainThemeForegroundColor} />
                          <Text style={[styles.text, {color: AppStyles.colorSet.mainThemeForegroundColor}]}>
                              Back
                          </Text>
                      </TouchableOpacity>
                      <View style={styles.header}>
                          <Text style={styles.title}>Settings</Text>
                      </View>
                      <View style={styles.header}/>
                  </View>
                  <ScrollView style={styles.body}>
                      <View style={styles.labelView}>
                          <Text style={styles.label}>DISCOVERY</Text>
                      </View>
                      <View style={styles.contentView}>
                          <View style={styles.itemView}>
                              <Text style={styles.text}>Show me on Instadating</Text>
                              <Switch
                                  value={this.props.appSettings.showMe}
                                  onValueChange={value => this.onSwitchToggle(value, 'SHOW_ME')}
                                  style={styles.switch}
                              />
                          </View>
                      </View>
                      <View style={styles.captionView}>
                          <Text style={styles.caption}>
                              While turned off, you will not be shown in the card stack.
                              You can still see and chat with your matches.
                          </Text>
                      </View>
                      <View style={styles.labelView}>
                          <Text style={styles.label}>PUSH NOTIFICATIONS</Text>
                      </View>
                      <View style={styles.contentView}>
                          <View style={styles.itemView}>
                              <Text style={styles.text}>New Matches</Text>
                              <Switch
                                  value={this.props.appSettings.newMatches}
                                  onValueChange={value => this.onSwitchToggle(value, 'NEW_MATCHES')}
                                  style={styles.switch}
                              />
                          </View>
                          <View style={styles.lineView}/>
                          <View style={styles.itemView}>
                              <Text style={styles.text}>Messages</Text>
                              <Switch
                                  value={this.props.appSettings.messages}
                                  onValueChange={value => this.onSwitchToggle(value, 'MESSAGES')}
                                  style={styles.switch}
                              />
                          </View>
                          <View style={styles.lineView}/>
                          <View style={styles.itemView}>
                              <Text style={styles.text}>Super Likes</Text>
                              <Switch
                                  value={this.props.appSettings.superLike}
                                  onValueChange={value => this.onSwitchToggle(value, 'SUPER_LIKE')}
                                  style={styles.switch}
                              />
                          </View>
                          <View style={styles.lineView}/>
                          <View style={styles.itemView}>
                              <Text style={styles.text}>Top Picks</Text>
                              <Switch
                                  value={this.props.appSettings.topPicks}
                                  onValueChange={value => this.onSwitchToggle(value, 'TOP_PICKS')}
                                  style={styles.switch}
                              />
                          </View>
                      </View>
                      <View style={styles.labelView}>
                          <Text style={styles.label}>GENDER</Text>
                      </View>
                      <View style={styles.contentView}>
                        {this.state.genderData.map((option, index) => {
                          return this.props.appSettings.selectedGenderIndex === index
                            ? this.renderOption(option, index, this.state.genderData, {color: 'blue'})
                            : this.renderOption(option,index, this.state.genderData,);
                        })}
                      </View>
                      <View style={styles.captionView}>
                          <Text style={styles.caption}>
                              You will get recommendations based on your gender.
                          </Text>
                      </View>
                      <View style={styles.labelView}>
                          <Text style={styles.label}>MAXIMUM DISTANCE</Text>
                      </View>
                      <View style={styles.contentView}>
                        {this.state.distanceData.map((option, index) => {
                          return this.props.appSettings.selectedDistanceIndex === index
                            ? this.renderOption(option, index, this.state.distanceData, {color: 'blue'})
                            : this.renderOption(option,index, this.state.distanceData,);
                        })}
                      </View>

                      <View style={styles.captionView}>
                          <Text style={styles.caption}>
                              You will get recommendations in this area.
                          </Text>
                      </View>
                      <View style={styles.labelView}>
                          <Text style={styles.label}>ACCOUNT</Text>
                      </View>
                      <View style={styles.contentView}>
                          <View style={styles.itemButton}>
                              <Text style={[styles.text, {color: '#384c8d'}]}>Support</Text>
                          </View>
                          <View style={styles.lineView}/>
                          <TouchableOpacity onPress={() => this.props.navigation.dispatch({ type: 'Logout'})} style={styles.itemButton}>
                              <Text style={[styles.text, {color: '#384c8d'}]}>Log out</Text>
                          </TouchableOpacity>
                      </View>
                      <View style={styles.labelView}/>
                  </ScrollView>
              </View>
              </SafeAreaView>
              <SafeAreaView style={{ flex: 0, backgroundColor: 'rgb(244,246,251)' }} />
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
        height: Platform.OS === "ios" ? 50 : 0,
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
        marginTop: 5
        // justifyContent: 'center'
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
    appSettings: state.appSettings,
    user: state.auth.user,
});

export default connect(mapStateToProps)(SettingScreen);
