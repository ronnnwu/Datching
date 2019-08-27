import React, { Component, Fragment } from 'react';
import { FlatList, Image, StyleSheet, Platform, Text, TextInput, TouchableOpacity, View, StatusBar, SafeAreaView } from 'react-native';
// import FastImage from 'react-native-fast-image-expo';
import { connect } from 'react-redux';
import AppStyles from '../AppStyles';
import ActionSheet from 'react-native-actionsheet'
import DialogInput from 'react-native-dialog-input';
import firebase from 'firebase';
import '@firebase/firestore';
import ImagePicker from 'react-native-image-picker';
import { KeyboardAwareView } from 'react-native-keyboard-aware-view';
import Icon from 'react-native-vector-icons/Ionicons';
import { size } from '../helpers/devices';

class ChatScreen extends Component {
    // static navigationOptions = ({ navigation }) => {
    //     let title = navigation.state.params.channel.name;
    //     let isOne2OneChannel = false;
    //     if (!title) {
    //         isOne2OneChannel = true;
    //         title = navigation.state.params.channel.participants[0].firstName;
    //     }
    //     const options = {
    //         title: title,
    //     }
    //     if (!isOne2OneChannel) {
    //         options.headerRight = <TextButton style={AppStyles.styleSet.rightNavButton} onPress={() => navigation.state.params.onSetting()} >Settings</TextButton>
    //     }
    //     return options;
    // };

    constructor(props) {
        super(props);

        const channel = props.navigation.getParam('channel');

        this.state = {
            isRenameDialogVisible: false,
            channel: channel,
            threads: [],
            input: '',
            photo: null,
            downloadUrl: '',
        }

        this.threadsRef = firebase.firestore().collection('channels').doc(channel.id).collection('threads').orderBy('created', 'desc');
        this.threadsUnscribe = null;
    }

    componentDidMount() {
        this.threadsUnscribe = this.threadsRef.onSnapshot(this.onThreadsCollectionUpdate);
        this.props.navigation.setParams({
            onSetting: this.onSetting
        });
    }

    componentWillUnmount() {
        this.threadsUnscribe();

        StatusBar.setHidden(false);

    }

    existSameSentMessage = (messages, newMessage) => {
        for (let i = 0; i < messages.length; i++) {
            const temp = messages[i];
            if (newMessage.senderID == temp.senderID && temp.content == newMessage.content && temp.created == newMessage.created) {
                return true;
            }
        }

        return false;
    }

    onThreadsCollectionUpdate = (querySnapshot) => {

        const data = [];
        querySnapshot.forEach((doc) => {
            const message = doc.data();
            message.id = doc.id;

            if (!this.existSameSentMessage(data, message)) {
                data.push(message);
            }

        });

        this.setState({ threads: data });

    }

    onSettingActionDone = (index) => {
        if (index == 0) {
            this.showRenameDialog(true);
        } else if (index == 1) {
            this.onLeave();
        }
    }

    onConfirmActionDone = (index) => {
        if (index == 0) {
            firebase.firestore().collection('channel_participation')
                .where('channel', '==', this.state.channel.id)
                .where('user', '==', this.props.user.userID)
                .get().then(querySnapshot => {
                    querySnapshot.forEach(function (doc) {
                        doc.ref.delete();
                    });
                    this.props.navigation.goBack(null);
                });
        }
    }

    onSetting = () => {
        this.settingActionSheet.show();
    }

    onLeave = () => {
        this.confirmLeaveActionSheet.show();
    }

    onPressChat = (chat) => {

    }


    createOne2OneChannel = () => {
        const channelData = {
            creator_id: this.props.user.userID,
            name: '',
            lastMessage: this.state.input,
            lastMessageDate: firebase.firestore.FieldValue.serverTimestamp()
        };

        const { userID, firstName, profilePictureURL } = this.props.user;

        const that = this;

        firebase.firestore().collection('channels').add(channelData).then(function (docRef) {

            channelData.id = docRef.id;
            channelData.participants = that.state.channel.participants;
            that.setState({ channel: channelData });

            const participationData = {
                channel: docRef.id,
                user: that.props.user.userID,
            }
            firebase.firestore().collection('channel_participation').add(participationData);
            let created = Date.now();
            channelData.participants.forEach(friend => {
                const participationData = {
                    channel: docRef.id,
                    user: friend.userID,
                }
                firebase.firestore().collection('channel_participation').add(participationData);

                const data = {
                    content: that.state.input,
                    created: created,
                    recipientFirstName: friend.firstName,
                    recipientID: friend.userID,
                    recipientLastName: '',
                    recipientProfilePictureURL: friend.profilePictureURL,
                    senderFirstName: firstName,
                    senderID: userID,
                    senderLastName: '',
                    senderProfilePictureURL: profilePictureURL,
                    url: that.state.downloadUrl,
                }

                firebase.firestore().collection('channels').doc(channelData.id).collection('threads').add(data).then(function (docRef) {
                    // alert('Successfully sent friend request!');
                }).catch(function (error) {
                    alert(error);
                });

            });
            firebase.firestore().collection('channels').doc(channelData.id).update({id: channelData.id});
            that.threadsRef = firebase.firestore().collection('channels').doc(channelData.id).collection('threads').orderBy('created', 'desc');
            that.threadsUnscribe = that.threadsRef.onSnapshot(that.onThreadsCollectionUpdate);

            that.setState({ input: '', downloadUrl: '', photo: '' });

        }).catch(function (error) {
            alert(error);
        });

    }

    uploadPromise = () => {
        const uri = this.state.photo;
        return new Promise((resolve, reject) => {
            let filename = uri.substring(uri.lastIndexOf('/') + 1);
            const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
            firebase.storage().ref(filename).putFile(uploadUri).then(function (snapshot) {
                resolve(snapshot.downloadURL);
            });
        });
    }

    _send = () => {
        if (!this.state.channel.id) {
            this.createOne2OneChannel();
        } else {
            const { userID, firstName, profilePictureURL } = this.props.user;
            let created = Date.now();
            this.state.channel.participants.forEach(friend => {
                const data = {
                    content: this.state.input,
                    created: created,
                    recipientFirstName: friend.firstName,
                    recipientID: friend.userID,
                    recipientLastName: '',
                    recipientProfilePictureURL: friend.profilePictureURL,
                    senderFirstName: firstName,
                    senderID: userID,
                    senderLastName: '',
                    senderProfilePictureURL: profilePictureURL,
                    url: this.state.downloadUrl,
                }

                firebase.firestore().collection('channels').doc(this.state.channel.id).collection('threads').add(data).then(function (docRef) {
                    // alert('Successfully sent friend request!');
                }).catch(function (error) {
                    alert(error);
                });
            });

            let lastMessage = this.state.downloadUrl;
            if (!lastMessage) {
                lastMessage = this.state.input;
            }

            const channel = { ...this.state.channel };

            delete channel.participants;
            channel.lastMessage = lastMessage;
            channel.lastMessageDate = firebase.firestore.FieldValue.serverTimestamp();

            firebase.firestore().collection('channels').doc(this.state.channel.id).set(channel);
            this.setState({ input: '', downloadUrl: '', photo: '' });
        }
    }

    onSend = () => {
        this._send();
    }

    onSelect = () => {
        const options = {
            title: 'Select a photo',
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };

        const { userID, firstName, profilePictureURL } = this.props.user;

        ImagePicker.showImagePicker(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {

                const data = {
                    content: '',
                    created: Date.now(),
                    senderFirstName: firstName,
                    senderID: userID,
                    senderLastName: '',
                    senderProfilePictureURL: profilePictureURL,
                    url: 'http://fake',
                }

                this.setState({
                    photo: response.uri,
                    threads: [data, ...this.state.threads],
                });

                this.uploadPromise().then((url) => {
                    this.setState({ downloadUrl: url });
                    this._send();
                });
            }
        });
    }

    showRenameDialog = (show) => {
        this.setState({ isRenameDialogVisible: show });
    }

    onChangeName = (text) => {

        this.showRenameDialog(false);

        const channel = { ...this.state.channel };
        delete channel.participants;
        channel.name = text;

        firebase.firestore().collection('channels').doc(this.state.channel.id).set(channel).then(() => {
            const newChannel = this.state.channel;
            newChannel.name = text;
            this.setState({ channel: newChannel });
            this.props.navigation.setParams({
                channel: newChannel
            });
        });
    }

    renderChatItem = ({ item }) => (
        <TouchableOpacity onPress={() => this.onPressChat(item)}>
            {item.senderID == this.props.user.userID &&
                <View style={styles.sendItemContainer}>
                    {item.url != '' &&
                        <View style={[styles.itemContent, styles.sendItemContent, { padding: 0 }]}>
                            <Image style={styles.sendPhotoMessage} source={{ uri: item.url }} />
                            <Image
                                source={AppStyles.iconSet.boederImgSend}
                                style={styles.boederImgSend}
                            />
                        </View>
                    }
                    {item.url == '' &&
                        <View style={[styles.itemContent, styles.sendItemContent, {right: 10, maxWidth: '65%'}]}>
                            <Text style={styles.sendTextMessage}>{item.content}</Text>
                            <Image
                                source={AppStyles.iconSet.textBoederImgSend}
                                style={styles.textBoederImgSend}
                            />
                        </View>
                    }
                    <Image style={styles.userIcon} source={{ uri: item.senderProfilePictureURL }} />
                </View>
            }
            {item.senderID != this.props.user.userID &&
                <View style={styles.receiveItemContainer}>
                    <Image style={styles.userIcon} source={{ uri: item.senderProfilePictureURL }} />
                    {item.url != '' &&
                        <View style={[styles.itemContent, styles.receiveItemContent, { padding: 0 }]}>
                            <Image style={styles.receivePhotoMessage} source={{ uri: item.url }} />
                            <Image
                                source={AppStyles.iconSet.boederImgReceive}
                                style={styles.boederImgReceive}
                            />
                        </View>
                    }
                    {item.url == '' &&
                        <View style={[styles.itemContent, styles.receiveItemContent, {left: 10, maxWidth: '65%'}]}>
                            <Text style={styles.receiveTextMessage}>{item.content}</Text>
                            <Image
                                source={AppStyles.iconSet.textBoederImgReceive}
                                style={styles.textBoederImgReceive}
                            />
                        </View>
                    }

                </View>
            }
        </TouchableOpacity>
    );

    isDisable = () => {
        return !this.state.input;
    }

    sendBtnStyle = () => {
        const style = { padding: 10 };
        if (this.isDisable()) {
            style.opacity = 0.2;
        } else {
            style.opacity = 1;
        }
        return style;
    }

    render() {
        let title = this.state.channel.name;
        if (!title) {
            if (this.state.channel.participants.length > 0) {
                title = this.state.channel.participants[0].firstName;
            }
        }
        return (
          <Fragment>
            <StatusBar backgroundColor="white" barStyle="dark-content" />
            <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
              <View style={styles.container}>
                  <View style={styles.navbar}>
                      <TouchableOpacity style={[styles.header, {flexDirection: 'row', justifyContent: 'flex-start'}]} onPress={() => this.props.navigation.goBack()}>
                          <Icon style={styles.bacIcon} name="ios-arrow-back" size={35} color={AppStyles.colorSet.mainThemeForegroundColor} />
                          <Text style={[styles.text, {color: AppStyles.colorSet.mainThemeForegroundColor}]}>
                              Back
                          </Text>
                      </TouchableOpacity>
                      <View style={styles.header}>
                          <Text style={styles.text}>
                              {title}
                          </Text>
                      </View>
                      <View style={styles.header}/>
                  </View>
                  <KeyboardAwareView style={styles.chats}>
                      <FlatList
                          inverted
                          vertical
                          showsVerticalScrollIndicator={false}
                          data={this.state.threads}
                          renderItem={this.renderChatItem}
                          keyExtractor={item => `${item.id}`}
                      />

                      <View style={styles.inputBar}>
                          <TouchableOpacity style={styles.btnContainer} onPress={this.onSelect}>
                              <Image style={styles.icon} source={AppStyles.iconSet.camera_filled} />
                          </TouchableOpacity>
                          <TextInput
                              style={styles.input}
                              value={this.state.input}
                              multiline={true}
                              onChangeText={(text) => this.setState({ input: text })}
                              placeholder='Start typing...'
                              underlineColorAndroid='transparent' />
                          <TouchableOpacity disabled={this.isDisable()} style={this.sendBtnStyle()} onPress={this.onSend}>
                              <Image style={styles.icon} source={AppStyles.iconSet.share} />
                          </TouchableOpacity>
                      </View>
                  </KeyboardAwareView>
                  <ActionSheet
                      ref={o => this.settingActionSheet = o}
                      title={'Group Settings'}
                      options={['Rename Group', 'Leave Group', 'Cancel']}
                      cancelButtonIndex={2}
                      destructiveButtonIndex={1}
                      onPress={(index) => { this.onSettingActionDone(index) }}
                  />
                  <ActionSheet
                      ref={o => this.confirmLeaveActionSheet = o}
                      title={'Are you sure?'}
                      options={['Confirm', 'Cancel']}
                      cancelButtonIndex={1}
                      destructiveButtonIndex={0}
                      onPress={(index) => { this.onConfirmActionDone(index) }}
                  />
                  <DialogInput isDialogVisible={this.state.isRenameDialogVisible}
                      title={'Change Name'}
                      hintInput={this.state.channel.name}
                      textInputProps={{ selectTextOnFocus: true }}
                      submitText={'OK'}
                      submitInput={(inputText) => { this.onChangeName(inputText) }}
                      closeDialog={() => { this.showRenameDialog(false) }}>
                  </DialogInput>
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
        height: Platform.OS === "ios" ? 40 : 0,
        backgroundColor: AppStyles.colorSet.mainThemeBackgroundColor,
    },
    navbar: {
        height: Platform.OS === "ios" ? 60 : 69,
        width: '100%',
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: AppStyles.colorSet.mainThemeBackgroundColor,
    },
    header: {
        flex: 0.3,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Platform.OS === "ios" ? 18 : 0
    },
    bacIcon: {
        marginHorizontal: 10,
        marginTop: Platform.OS === "ios" ? 0 : 8,
    },
    text: {
        fontSize: 20,
        paddingTop: Platform.OS === "ios" ? 0 : 8,
    },
    chats: {
        padding: 10,
        flex: 1,
    },
    itemContent: {
        padding: 10,
        backgroundColor: AppStyles.colorSet.hairlineColor,
        borderRadius: 10,
        maxWidth: '80%',
    },
    sendItemContainer: {
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        flexDirection: 'row',
        marginBottom: 10,
    },
    userIcon: {
        width: 34,
        height: 34,
        borderRadius: 17,
    },
    sendItemContent: {
        marginRight: 10,
        backgroundColor: AppStyles.colorSet.mainThemeForegroundColor,
    },
    receiveItemContainer: {
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        flexDirection: 'row',
        marginBottom: 10,
    },
    receiveItemContent: {
        marginLeft: 10,
    },
    sendPhotoMessage: {
        width: size(300),
        height: size(250),
        borderRadius: 10,
    },
    boederImgSend: {
        position: 'absolute',
        width: size(300),
        height: size(250),
        resizeMode: 'stretch',
        tintColor: '#efeff4'
    },
    textBoederImgSend: {
        position: 'absolute',
        right: -5,
        bottom: 0,
        width: 20,
        height: 8,
        resizeMode: 'stretch',
        tintColor: AppStyles.colorSet.mainThemeForegroundColor
    },
    boederImgReceive: {
        position: 'absolute',
        width: size(300),
        height: size(250),
        resizeMode: 'stretch',
        tintColor: '#efeff4'
    },
    receivePhotoMessage: {
        width: size(300),
        height: size(250),
        borderRadius: 10,
    },
    textBoederImgReceive: {
        position: 'absolute',
        left: -5,
        bottom: 0,
        width: 20,
        height: 8,
        resizeMode: 'stretch',
        tintColor: AppStyles.colorSet.hairlineColor
    },
    sendTextMessage: {
        fontSize: 16,
        color: AppStyles.colorSet.mainThemeBackgroundColor,
    },
    receiveTextMessage: {
        color: AppStyles.colorSet.mainTextColor,
        fontSize: 16,
    },
    inputBar: {
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 2,
        borderTopColor: AppStyles.colorSet.hairlineColor,
        flexDirection: 'row',
        marginBottom: 10,
    },
    icon: {
        tintColor: AppStyles.colorSet.mainThemeForegroundColor,
        width: 25,
        height: 25,
    },
    input: {
        margin: 5,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 20,
        paddingRight: 20,
        flex: 1,
        backgroundColor: AppStyles.colorSet.grayBgColor,
        fontSize: 16,
        borderRadius: 20,
    }
});

const mapStateToProps = state => ({
    user: state.auth.user,
});

export default connect(mapStateToProps)(ChatScreen);
