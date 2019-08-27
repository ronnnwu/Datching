import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import firebase from 'firebase';
import '@firebase/firestore';

import AppStyles from '../AppStyles';
import { size } from '../helpers/devices';

// import FastImage from 'react-native-fast-image-expo';

export default class AvatorView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profilePictureURL: '',
      isOnline: false
    };
  }

  componentDidMount() {
    const user_uid = this.props.user.userID;
    const _this = this;

    this.usersUnsubscribe = firebase.firestore().collection('users').doc(user_uid).onSnapshot(function (user) {
      console.log('friend', user.data());
      if (user.exists) {
        _this.setState({
          profilePictureURL: user.data().profilePictureURL,
          isOnline: user.data().isOnline
        })
      } 
    });
  }

  componentWillUnmount() {
    if(this.usersUnsubscribe) this.usersUnsubscribe();
  }

  render() {
    const {profilePictureURL, isOnline} = this.state;
    return (
      <View style={[styles.container, this.props.style]}>
        <Image style={styles.profileIcon} source={{ uri: profilePictureURL }} />
        <View style={[styles.onlineView, isOnline && {backgroundColor: AppStyles.colorSet.mainThemeForegroundColor}]}/>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {

  },
  profileIcon: {
    height: 60,
    width: 60,
    borderRadius: 30,
  },
  onlineView: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: 'white',
    backgroundColor: 'gray'
  }
})