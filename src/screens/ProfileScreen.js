import React, { Component, Fragment } from 'react';
import { AsyncStorage, Platform, Text, TextInput, View, TouchableOpacity, StyleSheet, Alert, ScrollView, StatusBar, SafeAreaView } from 'react-native';
import AppStyles from '../AppStyles';
import firebase from 'firebase';
import '@firebase/firestore';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome5';

class ProfileScreen extends Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            firstName: null,
            lastName: null,
            bio: null,
            age: null,
            school: null,
            gender: null,
            genderPre: null,
            email: null,
            showGender: false,
            showGenderPre: false
        };
        this.userRef = firebase.firestore().collection('users').doc(this.props.user.id);
        this.lastScreen = this.props.navigation.getParam('lastScreen');

    }

    componentWillMount() {
        const self = this;
      self.userRef.get().then(function (user) {
            const {firstName, lastName, bio, age, school, gender, genderPre, email} = user.data();
            if (user.exists) {
                if (firstName) {self.setState({firstName})}
                if (lastName) {self.setState({lastName})}
                if (bio) {self.setState({bio})}
                if (age) {self.setState({age})}
                if (school) {self.setState({school})}
                if (gender) {self.setState({gender})}
                if (genderPre) {self.setState({genderPre})}
                if (email) {self.setState({email})}
            }
        });
        StatusBar.setHidden(false);

    }

    done() {
        const {firstName, lastName, bio, age, school, gender, genderPre, email} = this.state;

        if (firstName &&
            lastName &&
            bio &&
            age &&
            school &&
            gender &&
            genderPre &&
            email)
        {
            const data = {
                firstName,
                lastName,
                bio,
                age,
                school,
                gender,
                genderPre,
                email
            };

            if (this.props.user.profilePictureURL) this.props.navigation.dispatch({ type: 'IS_PROFILE_COMPLETE', value: true });

            if (this.lastScreen) {
              this.props.navigation.navigate('Swipe', { lastScreen: 'Profile' });
            } else {
              this.props.navigation.goBack();
               this.props.navigation.setParams({ lastScreen: '' });
            }

            this.updateUserInfo(data)

        } else {
            Alert.alert(
                'Please complete your profile',
                'Fill out all the blank fields',
                [
                  {text: 'OK', onPress: () => console.log('ok')},
                ],
                { cancelable: false }
            );
        }
    }

    updateUserInfo = (data) => {
      const self = this;

      self.userRef.update(data)
        .then(() => {
          self.userRef
            .get()
            .then(function(doc) {
              return doc.data();
            })
            .then(function(user) {
              console.log('user in AsyncStorage', user);
              AsyncStorage.setItem('@loggedInData:value', JSON.stringify(user));
              self.props.navigation.dispatch({ type: 'UPDATE_USER_DATA', user });
            });
        })
        .catch(function(error) {
          const { code, message } = error;
          console.log(message);
        });
    }

    render() {
        const {firstName, lastName, bio, age, school, gender, genderPre, email, showGender, showGenderPre} = this.state;
        return (
          <Fragment>
            <StatusBar backgroundColor="white" barStyle="dark-content" />
            <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
              <View style={styles.navbar}>
                { this.props.user.lastName ?
                  <TouchableOpacity style={styles.header} onPress={() => this.props.navigation.goBack()}>
                      <Text style={styles.headerText}>
                          Cancel
                      </Text>
                  </TouchableOpacity>
                  :
                  <View style={styles.header} />
                }
                  <View style={styles.header}>
                      <Text style={styles.title}>Edit Profile</Text>
                  </View>
                  <TouchableOpacity style={[styles.header, {alignItems: 'flex-end'}]} onPress={() => this.done()}>
                      <Text style={styles.headerText}>
                          Done
                      </Text>
                  </TouchableOpacity>
              </View>
              <ScrollView style={styles.container}>
                  <View style={styles.body}>
                      <View style={styles.labelView}>
                          <Text style={styles.label}>PUBLIC PROFILE</Text>
                      </View>
                      <View style={styles.contentView}>
                          <View style={styles.itemView}>
                              <Text style={styles.labelText}>First Name</Text>
                              <TextInput
                                  underlineColorAndroid="transparent"
                                  style={styles.text}
                                  editable={true}
                                  placeholderTextColor={AppStyles.colorSet.hairlineColor}
                                  placeholder='Your first name'
                                  value={firstName}
                                  onChangeText={text =>
                                      this.setState({firstName: text})
                                  }
                              />
                          </View>
                          <View style={styles.lineView}/>
                          <View style={styles.itemView}>
                              <Text style={styles.labelText}>Last Name</Text>
                              <TextInput
                                  underlineColorAndroid="transparent"
                                  style={styles.text}
                                  editable={true}
                                  placeholderTextColor={AppStyles.colorSet.hairlineColor}
                                  placeholder='Your last name'
                                  value={lastName}
                                  onChangeText={text =>
                                      this.setState({lastName: text})
                                  }
                              />
                          </View>
                          <View style={styles.lineView}/>
                          <View style={styles.itemView}>
                              <Text style={styles.labelText}>Bio</Text>
                              <TextInput
                                  underlineColorAndroid="transparent"
                                  style={styles.text}
                                  editable={true}
                                  placeholderTextColor={AppStyles.colorSet.hairlineColor}
                                  placeholder='Say something about you'
                                  value={bio}
                                  onChangeText={text =>
                                      this.setState({bio: text})
                                  }
                              />
                          </View>
                          <View style={styles.lineView}/>
                          <TouchableOpacity style={styles.itemView}>
                              <Text style={styles.labelText}>Age</Text>
                              <TextInput
                                  underlineColorAndroid="transparent"
                                  style={styles.text}
                                  editable={true}
                                  placeholderTextColor={AppStyles.colorSet.hairlineColor}
                                  placeholder='Your age'
                                  keyboardType={"numeric"}
                                  value={age}
                                  onChangeText={text =>
                                      this.setState({age: text})
                                  }
                              />
                          </TouchableOpacity>
                          <View style={styles.lineView}/>
                          <View style={styles.itemView}>
                              <Text style={styles.labelText}>School</Text>
                              <TextInput
                                  underlineColorAndroid="transparent"
                                  style={styles.text}
                                  editable={true}
                                  placeholderTextColor={AppStyles.colorSet.hairlineColor}
                                  placeholder='School'
                                  value={school}
                                  onChangeText={text =>
                                      this.setState({school: text})
                                  }
                              />
                          </View>
                          <View style={styles.lineView}/>
                          <TouchableOpacity
                              style={styles.itemView}
                              onPress={()=>this.setState({showGender: !showGender})}
                          >
                              <Text style={styles.labelText}>Gender</Text>
                              <Text style={styles.text}>{gender}</Text>
                          </TouchableOpacity>
                          {showGender &&
                          <View>
                              <View style={styles.lineView}/>
                              <TouchableOpacity
                                  style={styles.itemView}
                                  onPress={()=>this.setState({gender: 'Female'})}
                              >
                                  <Text style={styles.text}>    Female</Text>
                                  {gender=='Female' && <Icon name="check" size={25} color={'green'}/>}
                              </TouchableOpacity>
                              <View style={styles.lineView}/>
                              <TouchableOpacity
                                  style={styles.itemView}
                                  onPress={()=>this.setState({gender: 'Male'})}
                              >
                                  <Text style={styles.text}>    Male</Text>
                                  {gender=='Male' && <Icon name="check" size={25} color={'green'}/>}
                              </TouchableOpacity>
                          </View>}
                      </View>
                      <View style={styles.labelView}>
                          <Text style={styles.label}>PREFERENCES</Text>
                      </View>
                      <View style={styles.contentView}>
                          <TouchableOpacity
                              style={styles.itemView}
                              onPress={()=>this.setState({showGenderPre: !showGenderPre})}
                          >
                              <Text style={styles.labelText}>Gender Preference</Text>
                              <Text style={styles.text}>{genderPre}</Text>
                          </TouchableOpacity>
                          {showGenderPre &&
                          <View>
                              <View style={styles.lineView}/>
                              <TouchableOpacity
                                  style={styles.itemView}
                                  onPress={()=>this.setState({genderPre: 'Female'})}
                              >
                                  <Text style={styles.labelText}>    Female</Text>
                                  {genderPre=='Female' && <Icon name="check" size={25} color={'green'}/>}
                              </TouchableOpacity>
                              <View style={styles.lineView}/>
                              <TouchableOpacity
                                  style={styles.itemView}
                                  onPress={()=>this.setState({genderPre: 'Male'})}
                              >
                                  <Text style={styles.labelText}>    Male</Text>
                                  {genderPre=='Male' && <Icon name="check" size={25} color={'green'}/>}
                              </TouchableOpacity>
                              <View style={styles.lineView}/>
                              <TouchableOpacity
                                  style={styles.itemView}
                                  onPress={()=>this.setState({genderPre: 'Both'})}
                              >
                                  <Text style={styles.labelText}>    Both</Text>
                                  {genderPre=='Both' && <Icon name="check" size={25} color={'green'}/>}
                              </TouchableOpacity>
                          </View>}
                      </View>
                      <View style={styles.labelView}>
                          <Text style={styles.text}>PRIVATE DETAILS</Text>
                      </View>
                      <View style={styles.contentView}>
                          <View style={styles.itemView}>
                              <Text style={styles.labelText}>E-mail Address</Text>
                              <TextInput
                                  style={styles.text}
                                  editable={false}
                                  placeholderTextColor={AppStyles.colorSet.hairlineColor}
                                  placeholder='Your email'
                                  value={email}
                                  onChangeText={text =>
                                      this.setState({email: text})
                                  }
                              />
                          </View>
                      </View>
                  </View>
              </ScrollView>
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
    body: {
        width: '100%',
    },
        labelView: {
            width: '100%', height: 60,
            padding: 10,
            justifyContent: 'flex-end',
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
    title: {
        fontSize: 22,
        textAlign: 'center'
    },
    labelText: {
        fontSize: 20,
        paddingRight: 35
    },
    text: {
      fontSize: 20,
    },
    headerText: {
      fontSize: 20,
      right: 15,
      color: AppStyles.colorSet.mainThemeForegroundColor
    },
    placeholderText: {
        fontSize: 20,
        color: AppStyles.colorSet.hairlineColor,
    },
    label: {
        fontSize: 14,
        color: AppStyles.colorSet.mainTextColor,
    },
})

const mapStateToProps = state => ({
  appSettings: state.appSettings,
    user: state.auth.user,
});

export default connect(mapStateToProps)(ProfileScreen);
