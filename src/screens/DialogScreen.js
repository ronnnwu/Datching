import React from 'react';
import { Platform, Modal, Text, View, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AppStyles from '../AppStyles';
import Icon from 'react-native-vector-icons/Ionicons';

class DialogScreen extends React.Component {
    constructor() {
        super();
        this.state = {
            value: null
        };
    }

    componentWillMount() {
    }

    back() {
        this.props.navigation.navigate('Profile');
    }

    render() {
        return (
            <Modal
                animationType = {"fade"}
                supportedOrientations={['portrait', 'landscape']}
                transparent = {true} 
                visible = {this.props.visibleModal} 
                onRequestClose = {() => {}}
            >
            <View style={styles.container}>
                <View style={styles.statusbar} />
                <View style={styles.navbar}>
                    <TouchableOpacity style={[styles.header, {flexDirection: 'row', justifyContent: 'flex-start'}]} onPress={() => this.back()}>
                        <Icon style={styles.icon} name="ios-arrow-back" size={30} color={AppStyles.colorSet.mainThemeForegroundColor} />
                        <Text style={[styles.text, {color: AppStyles.colorSet.mainThemeForegroundColor}]}>
                            Back
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.header}>
                        <Text style={styles.title}>Contact</Text>
                    </View>
                    <View style={styles.header}/>
                </View>
                <ScrollView style={styles.body}>
                    <View style={styles.labelView}>
                        <Text style={styles.label}>CONTACT</Text>
                    </View>
                    <View style={styles.contentView}>
                        <View style={styles.addressView}>
                            <Text style={styles.text}>Our address</Text>
                            <Text style={styles.textcaption}>1412 Steiner Street, San Francisco, CA, 94115</Text>
                        </View>
                        <View style={styles.itemView}>
                            <Text style={styles.text}>E-mail us</Text>
                            {
                                this.state.school?
                                <Text style={styles.text}>{this.state.school}</Text>
                                :
                                <Text style={styles.placeholderText}>office@idating.com ></Text>
                            }
                        </View>
                    </View>
                    <View style={styles.captionView}>
                        <Text style={styles.caption}>
                            {'Our business hours are Mon - Fri, 10am - 5pm, PST.\n'}
                            
                        </Text>
                    </View>
                    <View style={styles.contentView}>
                        <View style={styles.itemButton}>
                            <Text style={[styles.text, {color: '#384c8d'}]}>Call Us</Text>
                        </View>
                    </View>
                    <View style={styles.labelView}/>
                </ScrollView>
            </View>
            </Modal>
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
        height: Platform.OS === "ios" ? 35 : 48,
        width: '100%',
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: AppStyles.colorSet.mainThemeBackgroundColor,
    },
        header: {
            flex: 0.3,
            alignItems: 'center',
            justifyContent: 'center'
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
            addressView: {
                width: '100%',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
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
    textcaption: {
        fontSize: 14
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

export default DialogScreen;