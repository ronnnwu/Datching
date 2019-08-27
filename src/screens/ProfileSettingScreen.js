import React, { Component, Fragment } from 'react';
import { AsyncStorage, Platform, StyleSheet, View, ScrollView, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, StatusBar, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomTabBar from '../components/custom_tab_bar';
import Swiper from 'react-native-swiper';
import { connect } from 'react-redux';
import firebase from 'firebase';
import '@firebase/firestore';
import ImagePicker from 'react-native-image-picker';
import ActionSheet from 'react-native-actionsheet';
// import FastImage from 'react-native-fast-image-expo';

import AppStyles from '../AppStyles';

class ProfileSettingScreen extends Component{
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      delItem: -1,
      myphotos: [],
      tabs: [AppStyles.iconSet.User, AppStyles.iconSet.fireIcon, AppStyles.iconSet.Message],
    };
    this.userRef = firebase.firestore().collection('users').doc(this.props.user.id);
  }

  componentWillMount() {
    console.log(this.props.user);
    this.updatePhotos(this.props.user.photos);
    StatusBar.setHidden(false);
  }

  updatePhotos(photos) {
    let myphotos = [];
    let pphotos = photos ? [...photos] : [];
    let temp = [];
    pphotos.push({add: true});
    pphotos.map((item, index) => {
      temp.push(item);
      if(index % 6 == 5) {
        myphotos.push(temp);
        temp = [];
      } else if(item.add) {
        myphotos.push(temp);
        temp = [];
      }
    });
    this.setState({myphotos, loading: false, delItem: -1}, () => {
    });
  }

  goToPage(i) {
    if (i == 0) { this.props.navigation.navigate('ProfileSetting')}
    if (i == 1) { this.props.navigation.navigate('Swipe') }
    if (i == 2) { this.props.navigation.navigate('Home') }
  }

  detail() {this.props.navigation.navigate('Profile')}
  setting() {this.props.navigation.navigate('Setting', {userId: this.props.user.id})}
  contact() {this.props.navigation.navigate('Contact')}
  logout() {this.props.navigation.dispatch({ type: 'Logout' })}

  onSelectAddPhoto = () => {
    const options = {
        title: 'Add Photo',
        storageOptions: {
            skipBackup: true,
            path: 'images',
        },
    };
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
          console.log('User cancelled image picker');
      } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
      } else {
        this.setState({loading: true});
        this.uploadPromise(response.uri).then((url) => {
          const { id, photos } = this.props.user;
          let pphotos = photos ? photos : [];
          pphotos.push(url)
          const data = {
            photos: pphotos
          };
          this.updateUserInfo(data);
          this.updatePhotos(pphotos);
        });
      }
    });
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

  onSelectDelPhoto = (index) => {
    this.removePhotoActionSheet.show();
    this.setState({delItem: index});
  }

  onRemoveActionDone = (index) => {
    if(index == 0) {
      this.setState({loading: true})
      const { id, photos } = this.props.user;
      const { delItem } = this.state;
      if (photos) {
        photos.splice(delItem, 1);
      }
      const data = {
        photos
      };

      this.updateUserInfo(data);
      this.updatePhotos(photos);
    }
  }

  uploadPromise = (url) => {
    const uri = url;
    return new Promise((resolve, reject) => {
      let filename = uri.substring(uri.lastIndexOf('/') + 1);
      const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
      firebase.storage().ref(filename).putFile(uploadUri).then(function (snapshot) {
          resolve(snapshot.downloadURL);
      });
    });
  }

  render() {
    const {firstName, lastName, phone, email, school, profilePictureURL} = this.props.user;
    const userLastName = lastName ? lastName : ' ';
    const {myphotos} = this.state;
    return(
      <Fragment>
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
          <View style = { styles.MainContainer }>
            <CustomTabBar
              id={0}
              tabs={this.state.tabs}
              goToPage={(i) => this.goToPage(i)}
            />
            <ScrollView style={styles.body}>
              <View style={styles.photoView}>
                <Image
                  style={{width: '100%', height: '100%'}}
                  source={{uri: profilePictureURL}}
                />
              </View>
              <View style={styles.nameView}>
                <Text style={styles.name}>
                  { firstName + ' ' + userLastName }
                </Text>
              </View>
              <View style={styles.myphotosView}>
                <View style={styles.itemView}>
                  <Text style={[styles.textLabel, {fontWeight: '700', fontSize: 20}]}>My Photos</Text>
                </View>
                <Swiper
                  showsButtons={false}
                  loop={false}
                  paginationStyle={{top: -230, left: null, right: 0}}
                  dot={<View style={{backgroundColor:'rgba(0,0,0,.2)', width: 8, height: 8,borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3,}} />}
                  activeDot={<View style={{backgroundColor: '#db6470', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3,}} />}
                >
                {myphotos.map((photos, i) => (
                  <View key={'photos'+i} style={styles.slide}>
                    <FlatList
                      horizontal={false}
                      numColumns={3}
                      data={photos}
                      scrollEnabled={false}
                      renderItem={({item, index}) => (
                        item.add ?
                          <TouchableOpacity
                            key={'item'+index}
                            style={[styles.myphotosItemView, {backgroundColor: AppStyles.colorSet.mainThemeForegroundColor}]}
                            onPress={this.onSelectAddPhoto.bind(this)}
                          >
                            <Icon style={styles.icon} name="ios-camera" size={40} color={AppStyles.colorSet.mainThemeBackgroundColor} />
                          </TouchableOpacity>
                        :
                          <TouchableOpacity
                            key={'item'+index}
                            style={styles.myphotosItemView}
                            onPress={() => this.onSelectDelPhoto(i*6+index)}
                          >
                            <Image
                              style={{width: '100%', height: '100%'}}
                              source={{uri: item}}
                            />
                          </TouchableOpacity>
                      )}
                    />
                  </View>
                ))}
                </Swiper>
              </View>
              <TouchableOpacity style={styles.optionView} onPress={this.detail.bind(this)}>
                <View style={styles.iconView}>
                  <Image
                    style={{width: 25, height: 25, tintColor: '#687cf0', resizeMode: 'cover'}}
                    source={ AppStyles.iconSet.account }
                  />
                </View>
                <View style={styles.textView}>
                  <Text style={styles.textLabel}>Account Details</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionView} onPress={this.setting.bind(this)}>
                <View style={styles.iconView}>
                  <Image
                    style={{width: 25, height: 25, tintColor: '#484361',resizeMode: 'cover'}}
                    source={ AppStyles.iconSet.setting }
                  />
                </View>
                <View style={styles.textView}>
                  <Text style={styles.textLabel}>Settings</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionView} onPress={this.contact.bind(this)}>
                <View style={styles.iconView}>
                  <Image
                    style={{width: 25, height: 25, tintColor: '#88e398', resizeMode: 'cover'}}
                    source={ AppStyles.iconSet.callIcon }
                  />
                </View>
                <View style={styles.textView}>
                  <Text style={styles.textLabel}>Contact Us</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutView} onPress={this.logout.bind(this)}>
                <Text style={styles.textLabel}>Logout</Text>
              </TouchableOpacity>
            </ScrollView>
            <ActionSheet
              ref={o => this.removePhotoActionSheet = o}
              title={'Remove Photo'}
              options={['Remove Photo', 'Cancel']}
              cancelButtonIndex={1}
              destructiveButtonIndex={0}
              onPress={(index) => { this.onRemoveActionDone(index) }}
            />
            {
              this.state.loading ?
              <View style={styles.progressbarContainer}>
                <ActivityIndicator size="large" color="white" animating={true}/>
              </View>
              : null
            }
          </View>
        </SafeAreaView>
      </Fragment>
    );
  }
}

const styles = StyleSheet.create(
{
  MainContainer: {
    flex: 1,
  },
  body: {
    width: '100%',
  },
    photoView: {
      top: Platform.OS === "ios" ? '0.5%' : '1%',
      width: '100%',
      height: 200,
    },
    nameView: {
      width: '100%',
      marginTop: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },
      name: {
        fontSize: 21,
        fontWeight: 'bold',
        marginRight: 10,
        color: '#262626',
        padding: 10
      },
    myphotosView: {
      width: '100%',
      height: 260,
      paddingHorizontal: 12,
      marginTop: 20,
      marginBottom: 30
    },
      text: {
        fontSize: 20
      },
      itemView: {
        width: '100%',
        paddingVertical: 2,
        marginVertical: 2,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
      },
        slide: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'flex-start',
        },
          myphotosItemView: {
            width: 100,
            height: 100,
            marginHorizontal: 8,
            marginVertical: 8,
            borderRadius: 15,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'grey',
            overflow: 'hidden'
          },
    optionView: {
      width: '100%',
      marginVertical: 9,
      paddingHorizontal: 12,
      flexDirection: 'row',
    },
      iconView: {
        flex: 0.2,
        justifyContent: 'center',
        alignItems: 'center',
      },
      textView: {
        flex: 0.8,
        justifyContent: 'center',
        alignItems: 'flex-start',
      },
      textLabel: {
        fontSize: 16,
        color: '#262626'
      },
    logoutView: {
      width: '92%',
      marginTop: 20,
      marginBottom: 50,
      marginHorizontal: 12,
      padding: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: AppStyles.colorSet.inputBgColor,
      justifyContent: 'center',
      alignItems: 'center',
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
    }
});

const mapStateToProps = state => ({
  user: state.auth.user,
});

export default connect(mapStateToProps)(ProfileSettingScreen);
