import React from 'react';
import { FlatList, TouchableOpacity, Modal, Image, StyleSheet, Text, View } from 'react-native';
import AppStyles from '../AppStyles';
// import FastImage from 'react-native-fast-image-expo';
import { connect } from 'react-redux';
import TextButton from 'react-native-button';
import firebase from 'firebase';
import '@firebase/firestore';
import DialogInput from 'react-native-dialog-input';
import { SafeAreaView } from 'react-navigation';

class CreateGroupModal extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            heAcceptedFriendships: [],
            hiAcceptedFriendships: [],
            friends: [],
            isNameDialogVisible: false,
            input: '',
        };

        this.heAcceptedFriendshipsRef = firebase.firestore().collection('friendships').where('user1', '==', this.props.user.userID);
        this.heAcceptedFriendshipssUnsubscribe = null;

        this.iAcceptedFriendshipsRef = firebase.firestore().collection('friendships').where('user2', '==', this.props.user.userID);
        this.iAcceptedFriendshipssUnsubscribe = null;
    }

    componentDidMount() {
        this.heAcceptedFriendshipssUnsubscribe = this.heAcceptedFriendshipsRef.onSnapshot(this.onHeAcceptedFriendShipsCollectionUpdate);
        this.iAcceptedFriendshipssUnsubscribe = this.iAcceptedFriendshipsRef.onSnapshot(this.onIAcceptedFriendShipsCollectionUpdate);
    }

    componentWillUnmount() {
        this.usersUnsubscribe();
        this.heAcceptedFriendshipssUnsubscribe();
        this.iAcceptedFriendshipssUnsubscribe();
    }

    onUsersCollectionUpdate = (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
            const user = doc.data();
            user.id = doc.id;

            const friendships_1 = this.state.heAcceptedFriendships.filter(friend => {
                return friend.user2 == user.id;
            });

            const friendships_2 = this.state.iAcceptedFriendships.filter(friend => {
                return friend.user1 == user.id;
            });

            user.checked = false;
            if (friendships_1.length > 0) {
                user.friendshipId = friendships_1[0].id;
                data.push(user);
            } else if (friendships_2.length > 0) {
                user.friendshipId = friendships_2[0].id;
                data.push(user);
            }
        });

        this.setState({
            friends: data,
        });
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

    onCreate = () => {
        const checkedFriends = this.state.friends.filter(friend => friend.checked);
        if (checkedFriends.length == 0) {
            alert('Please check one more friends.');
        } else {
            this.showNameDialog(true);
        }
    }

    onCheck = (friend) => {
        friend.checked = !friend.checked;
        const newFriends = this.state.friends.map(item => {
            if (item.id == friend.id) {
                return friend;
            } else {
                return item;
            }
        });
        this.setState({ friends: newFriends });
    }

    showNameDialog = (show) => {
        this.setState({ isNameDialogVisible: show });
    }

    onSubmitName = (text) => {
        const channelData = {
            creator_id: this.props.user.userID,
            name: text,
            lastMessage: 'Created Group',
            lastMessageDate: firebase.firestore.FieldValue.serverTimestamp()
        };

        const { friends } = this.state;
        const that = this;

        firebase.firestore().collection('channels').add(channelData).then(function (docRef) {
            const participationData = {
                channel: docRef.id,
                user: that.props.user.userID,
            }
            firebase.firestore().collection('channel_participation').add(participationData);

            const checkedFriends = friends.filter(friend => friend.checked);
            checkedFriends.forEach(friend => {
                const participationData = {
                    channel: docRef.id,
                    user: friend.id,
                }
                firebase.firestore().collection('channel_participation').add(participationData);
            });

            that.showNameDialog(false);
            that.props.onCancel();
        }).catch(function (error) {
            alert(error);
        });

    }

    renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => this.onCheck(item)}>
            <View style={styles.container}>
                <Image style={styles.photo} source={{ uri: item.profilePictureURL }} />
                <Text style={styles.name}>{item.firstName}</Text>
                {item.checked &&
                    <Image style={styles.checked} source={AppStyles.iconSet.checked} />
                }
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
                    <View style={styles.topBar}>
                        <Text style={styles.title}>Choose People</Text>
                        <TouchableOpacity style={[AppStyles.styleSet.menuBtn.container, styles.leftBtn]} onPress={this.onCancel} >
                            <Image style={AppStyles.styleSet.menuBtn.icon} source={AppStyles.iconSet.delete} />
                        </TouchableOpacity>
                        <View style={styles.rightBtn}>
                            <TextButton style={styles.rightBtnText} onPress={this.onCreate} >Create Group</TextButton>
                        </View>

                    </View>
                    <FlatList
                        data={this.state.friends}
                        renderItem={this.renderItem}
                        keyExtractor={item => `${item.id}`}
                        initialNumToRender={5}
                    />
                    <DialogInput isDialogVisible={this.state.isNameDialogVisible}
                        title={'Input Group Name'}
                        hintInput={'Group Name'}
                        textInputProps={{ selectTextOnFocus: true }}
                        submitText={'OK'}
                        submitInput={(inputText) => { this.onSubmitName(inputText) }}
                        closeDialog={() => { this.showNameDialog(false) }}>
                    </DialogInput>

                </SafeAreaView>
            </Modal>
        );
    }
}


const styles = StyleSheet.create({
    modalView: {
        flex: 1,
    },
    container: {
        padding: 10,
        alignItems: 'center',
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: AppStyles.colorSet.mainSubtextColor,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    rightBtn: {
        position: 'absolute',
        top: 15,
        right: 10,
    },
    rightBtnText: {
        fontSize: 14,
        color: '#007aff',
        fontWeight: 'normal',
    },
    leftBtn: {
        position: 'absolute',
        left: 0,
    },
    title: {
        flex: 1,
        fontSize: 20,
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    photo: {
        height: 40,
        borderRadius: 20,
        width: 40,
    },
    name: {
        marginLeft: 20,
        alignSelf: 'center',
        flex: 1,
        color: AppStyles.colorSet.mainTextColor,
    },
    checkContainer: {
    },
    checked: {
        width: 30,
        height: 30,
    }

});

const mapStateToProps = state => ({
    user: state.auth.user,
});

export default connect(mapStateToProps)(CreateGroupModal);
