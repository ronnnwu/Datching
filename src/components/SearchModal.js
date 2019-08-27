import React from 'react';
import { FlatList, TouchableOpacity, Modal, StyleSheet, Text, View, Image } from 'react-native';
import { SearchBar } from "react-native-elements";
import AppStyles from '../AppStyles';
// import FastImage from 'react-native-fast-image-expo';
import { connect } from 'react-redux';
import TextButton from 'react-native-button';
import firebase from 'firebase';
import '@firebase/firestore';
import { SafeAreaView } from 'react-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { KeyboardAwareView } from 'react-native-keyboard-aware-view';

const REQUEST_NONE = 0;
const REQUEST_TO_HIM = 1;
const REQUEST_TO_ME = 2;

class SearchModal extends React.Component {

    constructor(props) {
        super(props);

        this.usersRef = firebase.firestore().collection('users');
        this.usersUnsubscribe = null;

        this.heAcceptedFriendshipsRef = firebase.firestore().collection('friendships').where('user1', '==', this.props.user.userID);
        this.heAcceptedFriendshipssUnsubscribe = null;

        this.iAcceptedFriendshipsRef = firebase.firestore().collection('friendships').where('user2', '==', this.props.user.userID);
        this.iAcceptedFriendshipssUnsubscribe = null;

        this.toMePendingFriendshipsRef = firebase.firestore().collection('pending_friendships').where('user2', '==', this.props.user.userID);
        this.toMePendingFriendshipssUnsubscribe = null;

        this.toHimPendingFriendshipsRef = firebase.firestore().collection('pending_friendships').where('user1', '==', this.props.user.userID);
        this.toHimPendingFriendshipssUnsubscribe = null;

        this.state = {
            heAcceptedFriendships: [],
            hiAcceptedFriendships: [],
            friends: [],
            keyword: '',
            pendingFriends: [],
            users: [],
            filteredUsers: []
        };
    }


    componentDidMount() {

        this.usersUnsubscribe = this.usersRef.onSnapshot(this.onUsersCollectionUpdate);
        this.toMePendingFriendshipssUnsubscribe = this.toMePendingFriendshipsRef.onSnapshot(this.onPendingFriendShipsCollectionUpdate);
        this.toHimPendingFriendshipssUnsubscribe = this.toHimPendingFriendshipsRef.onSnapshot(this.onPendingFriendShipsCollectionUpdate);
        this.heAcceptedFriendshipssUnsubscribe = this.heAcceptedFriendshipsRef.onSnapshot(this.onHeAcceptedFriendShipsCollectionUpdate);
        this.iAcceptedFriendshipssUnsubscribe = this.iAcceptedFriendshipsRef.onSnapshot(this.onIAcceptedFriendShipsCollectionUpdate);
    }

    componentWillUnmount() {
        this.usersUnsubscribe();
        this.toMePendingFriendshipssUnsubscribe();
        this.toHimPendingFriendshipssUnsubscribe();
        this.heAcceptedFriendshipssUnsubscribe();
        this.iAcceptedFriendshipssUnsubscribe();
    }

    onHeAcceptedFriendShipsCollectionUpdate = (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
            const temp = doc.data();
            temp.id = doc.id;
            data.push(temp);
        });

        const newUsers = this.state.users.map(user => {
            const temp = data.filter(friendship => {
                return friendship.user2 == user.id;
            })
            if (temp.length > 0) {
                user.isFriend = true;
            }
            return user;
        });
        this.setState({
            heAcceptedFriendships: data,
            users: newUsers,
            filteredUsers: newUsers
        });
    }

    onIAcceptedFriendShipsCollectionUpdate = (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
            const temp = doc.data();
            temp.id = doc.id;
            data.push(temp);
        });

        const newUsers = this.state.users.map(user => {
            const temp = data.filter(friendship => {
                return friendship.user1 == user.id;
            })
            if (temp.length > 0) {
                user.isFriend = true;
            }
            return user;
        });
        this.setState({
            iAcceptedFriendships: data,
            users: newUsers,
            filteredUsers: newUsers
        });
    }

    onPendingFriendShipsCollectionUpdate = (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
            const temp = doc.data();
            temp.id = doc.id;
            data.push(temp);
        });

        const newUsers = this.state.users.map(user => {
            const temp = data.filter(pending => {
                return pending.user1 == user.id || pending.user2 == user.id;
            })
            if (temp.length > 0) {
                user.pendingId = temp[0].id;
                if (temp[0].user1 == this.props.user.userID) {
                    user.pending = REQUEST_TO_HIM;
                } else {
                    user.pending = REQUEST_TO_ME;
                }
            } else if (!user.pending) {
                user.pending = REQUEST_NONE;
            }
            return user;
        });

        this.setState({
            pendingFriends: [...this.state.pendingFriends, data],
            users: newUsers,
            filteredUsers: newUsers
        });
    }



    onUsersCollectionUpdate = (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
            const user = doc.data();
            if (doc.id != this.props.user.userID) {
                data.push({ ...user, id: doc.id });
            }
        });

        this.setState({
            users: data,
            filteredUsers: data
        });
    }

    filteredUsers = (keyword) => {
        if (keyword) {
            return this.state.users.filter(user => {
                return user.firstName && user.firstName.toLowerCase().indexOf(keyword.toLowerCase()) >= 0;
            });
        } else {
            return this.state.users;
        }
    }

    onClear = () => {
        this.setState({ keyword: '' });
        const filteredUsers = this.filteredUsers('');
        this.setState({ filteredUsers: filteredUsers });
    }

    onSearch = (text) => {

        this.setState({ keyword: text });
        const filteredUsers = this.filteredUsers(text);
        this.setState({ filteredUsers: filteredUsers });
    }

    onPress = (item) => {
        this.props.navigation.navigate('Detail', { item: item });
    }

    onAdd = (item) => {
        const data = {
            user1: this.props.user.userID,
            user2: item.id,
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
        }
        firebase.firestore().collection('pending_friendships').add(data).then(function (docRef) {
            alert('Successfully sent friend request!');
        }).catch(function (error) {
            alert(error);
        });;
    }

    onAccept = (item) => {
        const data = {
            user1: item.id,
            user2: this.props.user.userID,
        }

        firebase.firestore().collection('pending_friendships').doc(item.pendingId).delete();
        firebase.firestore().collection('friendships').add(data).then(function (docRef) {
            alert('Successfully accept friend request!');
        }).catch(function (error) {
            alert(error);
        });
    }

    onPressUser = (item) => {

    }

    renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => this.onPressUser(item)}>
            <View style={styles.container}>
                <Image style={styles.photo} source={{ uri: item.profilePictureURL }} />
                <Text style={styles.name}>{item.firstName}</Text>

                {!item.isFriend && item.pending == REQUEST_NONE &&
                    <TextButton style={[styles.request, styles.add]} onPress={() => this.onAdd(item)} >Add</TextButton>
                }
                {!item.isFriend && item.pending == REQUEST_TO_ME &&
                    <TextButton style={[styles.request, styles.accept]} onPress={() => this.onAccept(item)} >Accept</TextButton>
                }
                {!item.isFriend && item.pending == REQUEST_TO_HIM &&
                    <TextButton style={[styles.request, styles.sent]} disabled={true}>Sent</TextButton>
                }
                <View style={styles.divider}></View>
            </View>
        </TouchableOpacity>
    );

    onCancel = () => {
        this.props.onCancel();
    }

    render() {
        return (
            <Modal
                animationType="slide"
                transparent={false}
                onRequestClose={this.onCancel}>
                <SafeAreaView style={styles.modalView}>
                    <View style={styles.searchBar}>
                        <SearchBar
                            containerStyle={[AppStyles.styleSet.searchBar.container, { marginLeft: 0 }]}
                            inputStyle={AppStyles.styleSet.searchBar.input}
                            showLoading
                            autoFocus={true}
                            clearIcon={true}
                            searchIcon={true}
                            value={this.state.keyword}
                            onChangeText={(text) => this.onSearch(text)}
                            onClear={this.onClear}
                            placeholder='Search' />
                        <TextButton style={[styles.cancelBtn, AppStyles.styleSet.rightNavButton]} onPress={() => this.onCancel()} >Cancel</TextButton>
                    </View>
                    <KeyboardAwareView>
                        <FlatList
                            style={styles.flat}
                            data={this.state.filteredUsers}
                            renderItem={this.renderItem}
                            keyExtractor={item => `${item.id}`}
                            initialNumToRender={5}
                        />
                    </KeyboardAwareView>
                </SafeAreaView>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    modalView: {
        flex: 1,
    },
    searchBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtn: {
        alignSelf: 'center',
    },
    flat: {
        flex: 1,
    },
    container: {
        padding: 10,
        alignItems: 'center',
        flexDirection: 'row',
    },
    photo: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    divider: {
        bottom: 0,
        left: 80,
        right: 10,
        position: 'absolute',
        height: 0.5,
        backgroundColor: '#e0e0e0',
    },
    name: {
        marginLeft: 20,
        alignSelf: 'center',
        flex: 1,
        fontSize: 17,
        fontWeight: 'bold',
        color: AppStyles.colorSet.mainTextColor,
    },
    request: {
        alignSelf: 'center',
        borderWidth: 0.5,
        borderColor: AppStyles.colorSet.hairlineColor,
        padding: 5,
        paddingLeft: 20,
        paddingRight: 20,
        borderRadius: 5,
        fontWeight: 'normal',
    },
    add: {
        color: AppStyles.colorSet.mainThemeForegroundColor,
    },
    sent: {
        color: AppStyles.colorSet.hairlineColor,
    },
    accept: {
        color: AppStyles.colorSet.mainThemeForegroundColor,
    },
    rightBtncontainer: {
        backgroundColor: AppStyles.colorSet.hairlineColor,
        justifyContent: 'center',
        paddingLeft: 20,
        paddingRight: 20,
    },
    rightBtnIcon: {
        alignSelf: 'center',
        tintColor: AppStyles.colorSet.mainThemeForegroundColor,
        width: 15,
        height: 15,
    },
});

const mapStateToProps = state => ({
    user: state.auth.user,
});

export default connect(mapStateToProps)(SearchModal);
