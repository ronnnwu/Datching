import React, { Component, Fragment } from 'react';
import { Platform, View, FlatList, Text, TextInput, Image, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
// import FastImage from 'react-native-fast-image-expo';
import { connect } from 'react-redux';
import AppStyles from '../AppStyles';
import apiData from '../dummy_data.json';
import ChatIconView from '../components/ChatIconView';
import AvatorView from '../components/AvatorView';
import firebase from 'firebase';
import '@firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import { size } from '../helpers/devices';
// import SearchModal from '../components/SearchModal';
// import CreateGroupModal from '../components/CreateGroupModal';

class HomeScreen extends Component {
    // static navigationOptions = ({ navigation }) => ({
    //     title: 'Chats',
    //     headerLeft:
    //         <TouchableOpacity style={AppStyles.styleSet.menuBtn.container} onPress={() => { navigation.openDrawer() }} >
    //             <Image style={AppStyles.styleSet.menuBtn.icon} source={AppStyles.iconSet.menu} />
    //         </TouchableOpacity>,
    //     headerRight:
    //         <TouchableOpacity style={AppStyles.styleSet.menuBtn.container} onPress={() => navigation.state.params.onCreate()}>
    //             <Image style={AppStyles.styleSet.menuBtn.icon} source={AppStyles.iconSet.inscription} />
    //         </TouchableOpacity>
    // });

    constructor(props) {
        super(props);
        this.state = {
            searchModalVisible: false,
            createGroupModalVisible: false,
            heAcceptedFriendships: [],
            iAcceptedFriendships: [],
            friends: [],
            chats: [],
            channelParticipations: [],
            channels: [],
        }

        this.heAcceptedFriendshipsRef = firebase.firestore().collection('swipes').where('author', '==', this.props.user.userID).where('type', '==', 'like');
        this.heAcceptedFriendshipsUnsubscribe = null;

        this.iAcceptedFriendshipsRef = firebase.firestore().collection('swipes').where('swipedProfile', '==', this.props.user.userID).where('type', '==', 'like');
        this.iAcceptedFriendshipsUnsubscribe = null;

        this.channelPaticipationRef = firebase.firestore().collection('channel_participation').where('user', '==', this.props.user.userID);
        this.channelPaticipationUnsubscribe = null;

        this.channelsRef = firebase.firestore().collection('channels').orderBy('lastMessageDate', 'desc');
        this.channelsUnsubscribe = null;

    }

    componentDidMount() {

        this.heAcceptedFriendshipsUnsubscribe = this.heAcceptedFriendshipsRef.onSnapshot(this.onHeAcceptedFriendShipsCollectionUpdate);
        this.iAcceptedFriendshipsUnsubscribe = this.iAcceptedFriendshipsRef.onSnapshot(this.onIAcceptedFriendShipsCollectionUpdate);
        this.channelPaticipationUnsubscribe = this.channelPaticipationRef.onSnapshot(this.onChannelParticipationCollectionUpdate);
        this.channelsUnsubscribe = this.channelsRef.onSnapshot(this.onChannelCollectionUpdate.bind(this));

        this.props.navigation.setParams({
            onCreate: this.onCreate
        });
    }

    componentWillUnmount() {
        if (this.usersUnsubscribe) this.usersUnsubscribe();
        if (this.heAcceptedFriendshipsUnsubscribe) this.heAcceptedFriendshipsUnsubscribe();
        if (this.usersUnsubscribe) this.iAcceptedFriendshipsUnsubscribe();
        if (this.iAcceptedFriendshipsUnsubscribe) this.channelPaticipationUnsubscribe();
        if (this.channelsUnsubscribe) this.channelsUnsubscribe();
    }

    onUsersCollectionUpdate = (querySnapshot) => {
      const heSwipedData = [];
      const iSwipedData = [];
      const matchArray = [];
        querySnapshot.forEach((doc) => {
            const user = doc.data();
            user.id = doc.id;

            const friendships_1 = this.state.heAcceptedFriendships.filter(friend => {
                return friend.swipedProfile == user.id;
            });

            const friendships_2 = this.state.iAcceptedFriendships.filter(friend => {
                return friend.author == user.id;
            });

            if (friendships_1.length > 0) {
                user.friendshipId = friendships_1[0].id;
                iSwipedData.push(user);
            }

            if (friendships_2.length > 0) {
                user.friendshipId = friendships_2[0].id;
                heSwipedData.push(user);
            }
        });

        //get match users
        iSwipedData.map((heUser) => {
            heSwipedData.map((iUser) => {
              if (iUser.id == heUser.id) {
                matchArray.push(iUser)
              }
            })
        });

        console.log('heSwipedData', heSwipedData);
        console.log('iSwipedData', iSwipedData);
        console.log('matchArray', matchArray);

        this.setState({
            friends: matchArray,
        });

        // this.setState({
        //     friends: data,
        // });
    }

    onHeAcceptedFriendShipsCollectionUpdate = (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
            const temp = doc.data();
            temp.id = doc.id;
            data.push(temp);
        });

        this.setState({
            heAcceptedFriendships: data,
        });

        if (this.usersUnsubscribe)
            this.usersUnsubscribe();

        this.usersRef = firebase.firestore().collection('users');
        this.usersUnsubscribe = this.usersRef.onSnapshot(this.onUsersCollectionUpdate);
    }

    onIAcceptedFriendShipsCollectionUpdate = (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
            const temp = doc.data();
            temp.id = doc.id;
            data.push(temp);
        });

        this.setState({
            iAcceptedFriendships: data,
        });

        if (this.usersUnsubscribe)
            this.usersUnsubscribe();

        this.usersRef = firebase.firestore().collection('users');
        this.usersUnsubscribe = this.usersRef.onSnapshot(this.onUsersCollectionUpdate);
    }

    onChannelParticipationCollectionUpdate = (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
            const user = doc.data();
            user.id = doc.id;

            if (user.id != this.props.user.userID) {
                data.push(user);
            }
        });

        const channels = this.state.channels.filter(channel => {
            return data.filter(participation => channel.id == participation.channel).length > 0
        });

        this.setState({
            channels: channels,
            channelParticipations: data,
        });

        if (this.channelsUnsubscribe) {
            this.channelsUnsubscribe();
        }
        this.channelsUnsubscribe = this.channelsRef.onSnapshot(this.onChannelCollectionUpdate.bind(this));
    }

    onChannelCollectionUpdate = (querySnapshot) => {
        const data = [];
        const channelPromiseArray = [];
        querySnapshot.forEach((doc) => {
            channelPromiseArray.push(new Promise((channelResolve, channelReject) => {
                const channel = doc.data();
                channel.id = doc.id;
                channel.participants = [];
                const filters = this.state.channelParticipations.filter(item => item.channel == channel.id);
                if (filters.length > 0) {
                    firebase.firestore().collection('channel_participation').where('channel', '==', channel.id).get().then((participationSnapshot) => {
                        const userPromiseArray = [];
                        participationSnapshot.forEach((participationDoc) => {
                            const participation = participationDoc.data();
                            participation.id = participationDoc.id;
                            if (participation.user != this.props.user.userID) {
                                userPromiseArray.push(new Promise((userResolve, userReject) => {
                                    firebase.firestore().collection('users').doc(participation.user).get().then((user) => {
                                        const userData = user.data();
                                        userData.id = user.id;
                                        userData.participationId = participation.id;
                                        channel.participants = [...channel.participants, userData];
                                        userResolve();
                                    });
                                }));
                            }
                        });
                        Promise.all(userPromiseArray).then(values => {
                            data.push(channel);
                            channelResolve();
                        });
                    });
                } else {
                    channelResolve();
                }
            }));

        });

        Promise.all(channelPromiseArray).then(values => {
            const sortedData = data.sort((a, b) => {
                return b.lastMessageDate - a.lastMessageDate;
            });

            this.setState({
                channels: sortedData,
            });
        });


    }

    onCreate = () => {
        this.setState({createGroupModalVisible: true});
    }

    onPressFriend = (friend) => {
        const one2OneChannel = this.state.channels.filter(channel => {
            return channel.participants.length == 1 && !channel.name && channel.participants[0].id == friend.userID;
        });
        let channel;
        if (one2OneChannel.length > 0) {
            channel = one2OneChannel[0];
        } else {
            channel = {
                name: friend.firstName,
                id: null,
                participants: [friend],
            };
        }

        this.props.navigation.navigate('Chat', { channel: channel });
    }

    renderFriendItem = ({ item }) => (
        <TouchableOpacity onPress={() => this.onPressFriend(item)}>
            <View style={styles.friendItemContainer}>
                <AvatorView  user={item}/>
                <Text style={styles.friendName}>{item.firstName.split(' ')[0]}</Text>
            </View>
        </TouchableOpacity>
    );

    renderFriendSeparator = () => {
        return (<View style={styles.friendDivider} />);
    };

    onPressChat = (chat) => {
        this.props.navigation.navigate('Chat', { channel: chat });
    }

    formatMessage = (item) => {
        if (item.lastMessage.startsWith('https://firebasestorage.googleapis.com')) {
            return 'Someone sent a photo.';
        }else{
            return item.lastMessage;
        }
    }
    renderChatItem = ({ item, index }) => {
        let title = item.name;
        if (!title) {
            if (item.participants.length > 0) {
                title = item.participants[0].firstName;
            }
        }
        return (
          <TouchableOpacity onPress={() => this.onPressChat(item)}>
            <View style={styles.chatItemContainer}>
                <ChatIconView style={styles.chatItemIcon} participants={item.participants} />
                <View style={styles.chatItemContent}>
                    <Text style={styles.chatFriendName}>{title}</Text>
                    <View style={styles.content}>
                        <Text numberOfLines={1} ellipsizeMode={'middle'} style={styles.message}>{this.formatMessage(item)} · { AppStyles.utils.timeFormat(item.lastMessageDate) }</Text>
                    </View>
                </View>
            </View>
          </TouchableOpacity>
        );
    };

    onTapSearch = () => {
        this.setState({searchModalVisible: true});
    }

    onSearchCancel = () => {
        this.setState({ searchModalVisible: false });
    }

    onCreateGroupCancel = () => {
        this.setState({ createGroupModalVisible: false });
    }

    render() {
        return (
          <Fragment>
            <StatusBar backgroundColor="white" barStyle="dark-content" />
            <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
              <View style={styles.container}>
                  <View style={styles.navbar}>
                      <TouchableOpacity style={[styles.header, {flexDirection: 'row', justifyContent: 'flex-start', alignSelf: 'flex-end'}]} onPress={() => this.props.navigation.goBack()}>
                          <Icon style={styles.icon} name="ios-arrow-back" size={35} color={AppStyles.colorSet.mainThemeForegroundColor} />
                          <Text style={[styles.text, {color: AppStyles.colorSet.mainThemeForegroundColor}]}>
                              Back
                          </Text>
                      </TouchableOpacity>
                      <View style={styles.header}>
                          <Image style={styles.image_style} source={AppStyles.iconSet.Message} />
                      </View>
                      <View style={styles.header}/>
                  </View>
                  <View style={styles.chats}>
                      <View style={styles.matchUser}>
                          <FlatList
                              horizontal={true}
                              initialNumToRender={4}
                              ItemSeparatorComponent={this.renderFriendSeparator}
                              data={this.state.friends}
                              showsHorizontalScrollIndicator={false}
                              renderItem={this.renderFriendItem}
                              keyExtractor={item => `${item.id}`}
                          />
                      </View>
                      <FlatList
                          vertical
                          showsVerticalScrollIndicator={false}
                          data={this.state.channels}
                          renderItem={this.renderChatItem}
                          keyExtractor={item => `${item.id}`}
                      />
                  </View>
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
        height: Platform.OS === "ios" ? 50 : 0,
        backgroundColor: AppStyles.colorSet.mainThemeBackgroundColor,
    },
    navbar: {
        height: Platform.OS === "ios" ? 60 : 69,
        width: '100%',
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        backgroundColor: AppStyles.colorSet.mainThemeBackgroundColor,
        marginBottom: 5
    },
    header: {
        flex: 0.3,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5
    },
    icon: {
        marginHorizontal: 10,
        marginBottom: Platform.OS === "ios" ? 0 : 5,
    },
    text: {
        fontSize: 20,
        paddingBottom: Platform.OS === "ios" ? 0 : 3,
    },
    image_style: {
        width: size(35),
        height: size(35),
        resizeMode: 'contain',
        tintColor: AppStyles.colorSet.mainThemeForegroundColor,
        marginBottom: 4
    },
    friendDivider: {
        width: 30,
        height: "100%",
    },
    friendItemContainer: {
        alignItems: 'center',
    },
    friendPhoto: {
        height: 60,
        borderRadius: 30,
        width: 60,
    },
    friendName: {
        marginTop: 10,
        alignSelf: 'center',
    },
    chats: {
        flex: 1,
        padding: 10,
    },
    matchUser: {
      padding: 10
    },
    chatItemContainer: {
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 10,
    },
    chatItemIcon: {
        height: 70,
        // borderRadius: 45,
        width: 70,
    },
    chatItemContent: {
        flex: 1,
        alignSelf: 'center',
        marginLeft: 10,
    },
    chatFriendName: {
        color: AppStyles.colorSet.mainTextColor,
        fontSize: 17,
    },
    content: {
        flexDirection: 'row',
    },
    message: {
        flex: 2,
        color: AppStyles.colorSet.mainSubtextColor
    },
    time: {
        marginLeft: 5,
        color: AppStyles.colorSet.mainSubtextColor
    }
});

const mapStateToProps = state => ({
    user: state.auth.user,
});

export default connect(mapStateToProps)(HomeScreen);


// <FlatList
//     horizontal={true}
//     initialNumToRender={4}
//     ItemSeparatorComponent={this.renderFriendSeparator}
//     data={this.state.friends}
//     showsHorizontalScrollIndicator={false}
//     renderItem={this.renderFriendItem}
//     keyExtractor={item => `${item.id}`}
// />
