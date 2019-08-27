import React, { Component, Fragment } from 'react';
import { ActivityIndicator, AsyncStorage, StyleSheet, View, Alert, StatusBar, SafeAreaView } from 'react-native';
import CustomTabBar from '../components/custom_tab_bar';
import Deck from '../components/swipe/deck';
import TinderCard from '../components/swipe/tinder_card';
import NoMoreCard from '../components/swipe/no_more_card';
import CardDetail from '../components/swipe/cardDetail';
import NewMatch from '../components/swipe/newMatch';
import AppStyles from '../AppStyles';
import firebase from 'firebase';
import '@firebase/firestore';
import { connect } from 'react-redux';

const DATA = [
  { id: 2, text: 'Card #2', url: 'https://pbs.twimg.com/profile_images/681369932207013888/CHESpTzF.jpg', name: 'Ceyhun', age: '25', school: 'Bahçeşehir Üniversitesi', distance: '1' },
  { id: 3, text: 'Card #3', url: 'https://c1.staticflickr.com/6/5252/5403292396_0804de9bcf_b.jpg', name: 'Özge', age: '29', school: 'Kocaeli Üniversitesi', distance: '2' },
  { id: 4, text: 'Card #4', url: 'https://pbs.twimg.com/media/BduTxWnIUAAKT_5.jpg', name: 'Özlem', age: '33', school: 'Yıldız Teknik Üniversitesi', distance: '3' },
  { id: 5, text: 'Card #5', url: 'https://c1.staticflickr.com/8/7175/6698567177_fc5df89f18_b.jpg', name: 'Eren', age: '31', school: 'Bahçeşehir Üniversitesi', distance: '5' },
  { id: 7, text: 'Card #7', url: 'https://www.rd.com/wp-content/uploads/2017/03/02-People-Share-the-Random-Act-of-Kindness-That-Changed-Their-Life-Fatima-M-Woods-380x254.jpg', name: 'Kağan', age: '25', school: 'Alman Üniversitesi', distance: '7' },
  { id: 8, text: 'Card #8', url: 'https://image.yenisafak.com/resim/imagecrop/2017/07/06/04/46/resized_6d734-9adcf410maxresdefault.jpg', name: 'Ozan', age: '26', school: 'Alman Üniversitesi', distance: '9' },
];

class SwipeScreen extends Component {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    this.state={
      detail: false,
      swipedUsers: [],
      recommendations: [],
      tabs: [AppStyles.iconSet.User, AppStyles.iconSet.fireIcon, AppStyles.iconSet.Message],
      showMode: 0,
      iSwipedFriends: [],
      heSwipedFriends: [],
      friends: [],
      newMatches: [],
      currentMatchData: {},
      alertCount: 0,
      loadedDeck: false
    }
    this.deckRef = c => {
      this.deck = c;
    }

    console.log('this.props.user.id', this.props.user.id);

    this.usersRef = firebase.firestore().collection('users');
    this.appSettingsRef = this.usersRef.doc(this.props.user.id).collection('settings');
    this.userRef = this.usersRef.doc(this.props.user.id);
    this.swipeRef = firebase.firestore().collection('swipes');

    this.iSwipedRef = this.swipeRef.where('author', '==', this.props.user.userID).where('type', '==', 'like');
    this.heSwipedRef = this.swipeRef.where('swipedProfile', '==', this.props.user.userID).where('type', '==', 'like');
  }

  componentWillMount() {
    this.handleIncompleteUserData();
    StatusBar.setHidden(false);
  }

  componentDidMount() {
    this.handleUserSwipeCollection();
    this.appSettingsUnsubscribe = this.appSettingsRef.onSnapshot(this.initializedAppsettings);
    this.iSwipedUnsubscribe = this.iSwipedRef.onSnapshot(this.onISwipeCollectionUpdate);
    this.heSwipedUnsubscribe = this.heSwipedRef.onSnapshot(this.onHeSwipeCollectionUpdate);
  }

  componentDidUpdate() {
    this.lastScreen = this.props.navigation.getParam('lastScreen');
    console.log('this.lastScreen in swipe screen before if', this.lastScreen);
    if (this.lastScreen) {
      console.log('this.lastScreen in swipe screen after if', this.lastScreen);
      this.manuallyGetRecommendations();
      this.props.navigation.setParams({ lastScreen: '' });
    }
  }

  componentWillUnmount() {
    if(this.usersUnsubscribe) this.usersUnsubscribe();
    if(this.userUnsubscribe) this.userUnsubscribe();
    if(this.iSwipedUnsubscribe) this.iSwipedUnsubscribe();
    if(this.heSwipedUnsubscribe) this.heSwipedUnsubscribe();
    if(this.appSettingsUnsubscribe) this.appSettingsUnsubscribe();
  }

  handleIncompleteUserData = () => {
    const self = this;
    self.usersRef.doc(this.props.user.userID).get().then(function (user) {
      if (user.exists) {
        const {firstName, lastName, age, email, profilePictureURL, gender, genderPre} = user.data();
        if (!firstName ||
          !lastName ||
          !age ||
          !email ||
          !profilePictureURL ||
          !gender ||
          !genderPre)
        {
          Alert.alert(
            'Let\'s complete your dating profile',
            'Welcome to instadating. Let\'s complete your dating profile to allow other people to express interest in you.',
            [
              {text: 'Let\'s go', onPress: () => {
                profilePictureURL?
                self.props.navigation.navigate('Profile', { lastScreen: 'Swipe' })
                :
                self.props.navigation.navigate('Addprofile')
              }},
            ],
            { cancelable: false }
          );
        } else {
          self.props.navigation.dispatch({ type: 'IS_PROFILE_COMPLETE', value: true });
        }
      }
    }).catch(function (error) {
        const { code, message } = error;
        alert(message);
    });
  }

  handleUserSwipeCollection = () => {
    const self = this;
    const data = [];

    self.swipeRef.where('author', '==', self.props.user.userID).get().then(function (swipes) {
      swipes.forEach(async(swipe) => {
        data.push(swipe.data().swipedProfile)
      });

      //this is the list of people i swiped for as a user
      self.setState({swipedUsers: data});
      self.usersUnsubscribe = self.usersRef.onSnapshot(self.updateRecommendations);
    });
  }

  handleNewMatchButtonTap = (value) => {
    this.setState({showMode: 0}, () => {
      setTimeout(() => {
        this.structureNewMatchAlert();
      }, 3000);
      this.props.navigation.navigate(value);
    });
  }

  initializedAppsettings = (querySnapshot) => {
    const data = [];

    querySnapshot.forEach((doc) => {
        const temp = doc.data();

        if (temp.type) {
          temp.id = doc.id;
          data.push(temp);
          this.props.navigation.dispatch({type: temp.type, value: temp.value})
        }
    });
  }

  onISwipeCollectionUpdate = (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
          const temp = doc.data();
          temp.id = doc.id;
          data.push(temp);
      });

      this.setState({
          iSwipedFriends: data,
      });

      // if (this.usersUnsubscribe)
      //     this.usersUnsubscribe();

      this.usersUnsubscribe = this.usersRef.onSnapshot(this.onUsersCollectionUpdate);
  }

  onHeSwipeCollectionUpdate = (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
          const temp = doc.data();
          temp.id = doc.id;
          data.push(temp);
      });

      this.setState({
          heSwipedFriends: data,
      });

      // if (this.usersUnsubscribe)
      //     this.usersUnsubscribe();

      this.usersUnsubscribe = this.usersRef.onSnapshot(this.onUsersCollectionUpdate);
  }

  onUsersCollectionUpdate = (querySnapshot) => {
      const iSwipeData = [];
      const heSwipeData = [];

      querySnapshot.forEach((doc) => {
          const user = doc.data();
          user.id = doc.id;

          // i swipe for he
          const friendships_1 = this.state.iSwipedFriends.filter(friend => {
              return friend.swipedProfile == user.id;
          });

          // he swipe for i
          const friendships_2 = this.state.heSwipedFriends.filter(friend => {
              return friend.author == user.id;
          });

          if (friendships_1.length > 0) {
              user.friendshipId = friendships_1[0].id;
              iSwipeData.push(user);
          }
          if (friendships_2.length > 0) {
              user.friendshipId = friendships_2[0].id;
              heSwipeData.push(user);
          }
      });

      const matchArray = this.getMatchUsers(heSwipeData, iSwipeData)

      this.setState({
          friends: matchArray,
      });

      // if (this.usersUnsubscribe)
      //     this.usersUnsubscribe();

      this.userUnsubscribe = this.userRef.onSnapshot(this.updateUserCollection);
  }

  getMatchUsers = (heSwipeData, iSwipeData) => {
    const matchArray = [];

    heSwipeData.map((heUser) => {
        iSwipeData.map((iUser) => {
          if (iUser.id == heUser.id) {
            matchArray.push(iUser.id)
          }
        })
    });

    console.log('iSwipeData', iSwipeData);
    console.log('heSwipeData', heSwipeData);
    console.log('matchArray', matchArray);

    return matchArray;
  }

  updateUserCollection = () => {
    const { friends } = this.state;
    const newMatches = [];
    const oldfriends = this.props.user.friends;

    if (friends.length > 0 ) {
      this.state.friends.map((newFriend) => {
        const isNewFriend = oldfriends && oldfriends.includes(newFriend);
        if (!isNewFriend) {
          newMatches.push(newFriend);
        }
      });
    }

    if (newMatches.length > 0) {
      this.setState({
        newMatches
      },() => this.updateUserFriendsCollection(friends));
    }

    console.log('newMatches', newMatches);
  }

  updateUserFriendsCollection = (friends) => {
      this.userRef
        .update({
          friends,
        })
        .then(() => {
          this.structureNewMatchAlert();
        })
        .then (() => {
          this.updateDeviceStorageData();
        })
        .catch(function(error) {
          console.log(error);
        });

    if (this.userUnsubscribe)
        this.userUnsubscribe();
  }

  updateDeviceStorageData = (user) => {
    this.getNewMatchUserData(this.props.user.id, (user) => {
      AsyncStorage.setItem('@loggedInData:value', JSON.stringify(user));
      this.props.navigation.dispatch({ type: 'UPDATE_USER_DATA', user });
    })
  }

  structureNewMatchAlert = async () => {
    const self = this;
    const {newMatches, alertCount} = self.state;

    if (newMatches.length > alertCount) {
      self.getNewMatchUserData(newMatches[alertCount], (currentMatchData) => {
        self.setState((prevState) => ({
          currentMatchData,
          alertCount: prevState.alertCount + 1,
        }), () => {
          self.setState({showMode: 2})
        });
      });
    } else {
      self.setState({
        newMatches: [],
        alertCount: 0,
      })
    }
  }

  manuallyGetRecommendations = () => {
    const self = this;
    let recommendations = [];
    const myPosition = this.props.user.position;
    const swipedUsers = this.state.swipedUsers;
    let genderPre = this.props.user.genderPre;

    self.setState({ loadedDeck: false})

    if(!genderPre) genderPre='Both';
    if(!myPosition) return;

    firebase
      .firestore()
      .collection('users')
      .get()
      .then(function(res) {
        res.docs.map(doc => {
          const recommendation = self.filterUsersForRecommendation(doc, { myPosition, swipedUsers, genderPre });
          if (recommendation) {
            recommendations.push(recommendation);
          }
        });
        self.setState({
          recommendations,
          loadedDeck: true
         });
      })
      .catch(function(error) {
        const { code, message } = error;
        console.log(message);
      });
  }

  filterUsersForRecommendation = (doc, { myPosition, swipedUsers, genderPre }) => {

    const self = this;

    const user = doc.data();
    user.id = doc.id;
    const { firstName, lastName, age, email, profilePictureURL, gender, position, userID } = user;
    const isNotUser = userID != this.props.user.userID;
    const hasPreviouslyNotBeenSwiped = swipedUsers.indexOf(userID) == -1;
    const isUserGenderInterest = genderPre == 'Both' ? true : gender == genderPre;
    const isProfileComplete = this.props.appSettings.isProfileComplete;

    if (firstName && lastName && age && email && profilePictureURL && gender && position &&
      isNotUser && hasPreviouslyNotBeenSwiped && isUserGenderInterest && isProfileComplete ) {
      user.distance = self.distance(position.latitude, position.longitude, myPosition.latitude, myPosition.longitude);
      console.log('user.distance is---', user.distance);

      return user;

    }
  }

  getNewMatchUserData = (id, callback) => {
    firebase
      .firestore()
      .collection('users')
      .doc(id)
      .get()
      .then(function(doc) {
        return doc.data();
      })
      .then(function(result) {
        callback(result)
      })
      .catch(function(error) {
        const { code, message } = error;
        console.log(message);
      });
  }

  distance(lat1, lon1, lat2, lon2, unit) {
    let radlat1 = (Math.PI * lat1) / 180;
    let radlat2 = (Math.PI * lat2) / 180;
    let theta = lon1 - lon2;
    let radtheta = (Math.PI * theta) / 180;
    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
      dist = dist * 1.609344;
    }

    return Math.round(dist);
  }

  updateRecommendations = (querySnapshot) => {
    const self = this;
    let recommendations = [];
    const myPosition = this.props.user.position;
    const swipedUsers = this.state.swipedUsers;
    let genderPre = this.props.user.genderPre;

    if(!genderPre) genderPre='Both';
    if(!myPosition) return;

    querySnapshot.forEach((doc) => {

       const recommendation = self.filterUsersForRecommendation(doc, { myPosition, swipedUsers, genderPre });
       if (recommendation) {
         recommendations.push(recommendation);
       }

    });

    console.log('recommendations', recommendations);

    //this give us list of posible matching data.;
    this.setState({
      recommendations,
      loadedDeck: true
    });

    if (this.usersUnsubscribe)
        this.usersUnsubscribe();
  }

  setShowMode(mode) {
    this.setState({showMode: mode})
  }

  onSwipe(type, item) {
    const self = this;
    const data = {
      author: this.props.user.userID,
      swipedProfile: item.userID,
      type
    };

    this.swipeRef.add(data).then(() => {
      const swipedUsers = self.state.swipedUsers;
      swipedUsers.push(item.userID);
      self.setState({swipedUsers, showMode: 0});
    });
  }

  renderCard(item) {
    return (
      <TinderCard
        key={'TinderCard'+item.userID}
        url={item.profilePictureURL}
        name={item.firstName}
        age={item.age}
        school={item.school}
        distance={item.distance}
        setShowMode={this.setShowMode.bind(this)}
      />
    );
  }

  renderCardDetail(item, isDone) {
    return (
      <CardDetail
        key={'CardDetail'+item.userID}
        profilePictureURL={item.profilePictureURL}
        firstName={item.firstName}
        age={item.age}
        school={item.school}
        distance={item.distance}
        bio={item.bio}
        instagramPhotos={item.photos}
        setShowMode={this.setShowMode.bind(this)}
        onSwipe={(direction) => this.deck.onSwipeComplete(direction)}
        isDone={isDone}

      />
    );
  }

  renderEmptyState() {
    return (
      <NoMoreCard
        profilePictureURL={this.props.user.profilePictureURL}
        isProfileComplete={this.props.appSettings.isProfileComplete}
      />
    );
  }

  renderNewMatch() {
    return (
      <NewMatch
        url={this.state.currentMatchData.profilePictureURL}
        onSendMessage={() => this.handleNewMatchButtonTap('Home')}
        onKeepSwiping={this.handleNewMatchButtonTap}
      />
    );
  }

  // detail() {
  //   this.setState({detail: true});
  // }

  goToPage(i) {
    if (i == 0) { this.props.navigation.navigate('ProfileSetting') }
    if (i == 1) { this.props.navigation.navigate('Swipe') }
    if (i == 2) { this.props.navigation.navigate('Home') }
  }

  render() {
    return (
      <Fragment>
        <StatusBar hidden={false} backgroundColor="white" barStyle="dark-content" />
        <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
          <View style={styles.container}>
            <CustomTabBar
              id={1}
              tabs={this.state.tabs}
              goToPage={this.goToPage.bind(this)}
            />
            { this.state.loadedDeck ?
              <Deck
                ref={this.deckRef}
                data={this.state.recommendations}
                renderCard={this.renderCard.bind(this)}
                renderCardDetail={this.renderCardDetail.bind(this)}
                renderNoMoreCards={this.renderEmptyState.bind(this)}
                renderNewMatch={this.renderNewMatch.bind(this)}
                onSwipeLeft={(item) => this.onSwipe('dislike', item)}
                onSwipeRight={(item) => this.onSwipe('like', item)}
                onSwipe={(direction, item) => this.onSwipe(direction, item)}
                showMode={this.state.showMode}
              /> :
              <View style={styles.activityIndicator}>
              <ActivityIndicator color={AppStyles.colorSet.mainThemeForegroundColor}/>
              </View>
            }
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
    backgroundColor: 'rgb(244,246,251)',
    height: '100%'
    // justifyContent: 'center',
  },
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
});

const mapStateToProps = state => ({
  appSettings: state.appSettings,
  user: state.auth.user,
});

//'https://pbs.twimg.com/profile_images/681369932207013888/CHESpTzF.jpg'

export default connect(mapStateToProps)(SwipeScreen);
