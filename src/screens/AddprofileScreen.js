import React from 'react';
import Button from 'react-native-button';
import { AsyncStorage, Platform, Text, View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firebase from 'firebase';
import '@firebase/firestore'; 
// import ImagePicker from 'react-native-image-picker';
import { Constants, ImagePicker, Permissions } from 'expo';
import AppStyles from '../AppStyles';
import { connect } from 'react-redux';

class AddprofileScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            url: null,
            photo: null,
        }
        this.userRef = firebase.firestore().collection('users').doc(this.props.user.id);
    }
 

    uploadPromise = () => {
        const uri = this.state.photo;
        return new Promise((resolve, reject) => {
            let filename = uri.substring(uri.lastIndexOf('/') + 1);
            const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
            firebase.storage().ref(filename).putFile(uploadUri).then(function (snapshot) {
                resolve(snapshot.downloadURL);
            }).catch(function(error){
                console.log(error.message)
            });
        });
    }

    _pickImage = async () => {
          
        await Permissions.askAsync(Permissions.CAMERA);  

        let pickerResult = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          cropping: true,
          aspect: [4, 3],title: 'Select a photo',
          storageOptions: {
              skipBackup: true,
              path: 'images',
          }
        });

        try { 
                alert('ddddddd')
              if (!pickerResult.cancelled) {
                url = await uploadImageAsync(pickerResult.uri);
                 
                this.setState({photo: pickerResult.uri});
    
                this.uploadPromise().then((url) => {
                    this.setState({url});
                    let user_uid = this.props.user.userID;
                    let data = {
                      profilePictureURL: url,
                      photos: [ url ]
                    };
                    // firebase.firestore().collection('users').doc(user_uid).update(data);
                    this.updateUserInfo(data);
                    this.props.navigation.dispatch({ type: 'Login' });
                    // this.props.navigation.dispatch({ type: 'UPDATE_USER_DATA', user: userData });
                });
     
              }
            } catch (e) {
              console.log(e);
              alert('Upload failed, sorry :(');
            } finally {
            //   this.setState({ uploading: false });
            alert("ddd");
            }
      };
    
    
    
    
 
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

    next() {this.props.navigation.navigate('Profile', { lastScreen: 'Profile' })}

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.logo}>
                    <Text style={styles.title}>Choose Profile Photo</Text>
                    {
                        this.state.photo?
                        (
                            this.state.url?
                            <View style={styles.imageView}>
                                <Image source={{uri: this.state.photo}} style={styles.image_photo}/>
                            </View>
                            :
                            <ActivityIndicator size="large" color="grey" animating={true} style={{marginTop: 100}}/>
                        )
                        :
                        <Icon name='md-camera' size={100} color='#eb5a6d' style={styles.icon_camera}/>
                    }
                </View>
                {
                    this.state.url?
                    <Button containerStyle={styles.button} style={styles.text}
                        onPress={() => this.next()}>
                        Next
                    </Button>
                    :
                    <Button containerStyle={styles.button} style={styles.text}
                        onPress={() => this._pickImage()}>
                        Add Profile Photo
                    </Button>
            }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logo: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50
    },
        title: {
            marginVertical: 20,
            fontSize: 20
        },
        imageView: {
            width: 100, height: 100,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 15,
            overflow: 'hidden',
            marginTop: 20,
        },
            image_photo: {
                width: '150%', height: '150%',
                resizeMode: 'contain'
            },
        icon_camera: {
            marginTop: 20
        },
    button: {
        width: '85%',
        backgroundColor: AppStyles.colorSet.mainThemeForegroundColor,
        borderRadius: 12,
        padding: 15,
        marginBottom: 50,
    },
        text: {
            fontSize: 20,
            fontWeight: 'bold',
            color: AppStyles.colorSet.mainThemeBackgroundColor,
        },
})

async function uploadImageAsync(uri) {
    // Why are we using XMLHttpRequest? See:
    // https://github.com/expo/expo/issues/2402#issuecomment-443726662
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response);
      };
      xhr.onerror = function(e) {
        console.log(e);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  
    const ref = firebase
      .storage()
      .ref()
      .child(uuid.v4());
    const snapshot = await ref.put(blob);
  
    // We're done with the blob, close and release it
    blob.close();
  
    return await snapshot.ref.getDownloadURL();
  };

const mapStateToProps = state => ({
    user: state.auth.user,
});

export default connect(mapStateToProps)(AddprofileScreen);
