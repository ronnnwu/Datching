import React, {Component} from 'react';
import {StyleSheet, View, StatusBar} from 'react-native';

import WorkThrough from 'WorkThrough';
import {icons} from '@assets';
import AppStyles from '../AppStyles';

const flowData = {
    fgColor: AppStyles.colorSet.mainThemeBackgroundColor,
    bgColor: AppStyles.colorSet.mainThemeForegroundColor,
    screens:
    [
        {icon: "fire-icon.png", title: "Get a Date", description: "Swipe right to get a match with people you like from your area."},
        {icon: "chat-icon.png", title: "Private Messages", description: "Chat privately with people you match."},
        {icon: "instagram.png", title: "Send Photos", description: "Have fun with your matches by sending photos and videos to each other."},
        {icon: "notification.png", title: "Get Notified", description: "Receive notifications when you get new messages and matches."},
    ]
}

export default class WorkThroughScreen extends Component {
    static navigationOptions = {
        header: null
    };

    componentDidMount(){
        StatusBar.setHidden(true);
    }

    _onWorkFlowFinished = () => {
        this.props.navigation.navigate('Welcome');
    }
    render() {
        return (
            <View style={styles.container}>
                <WorkThrough
                    iconpackage = {icons}
                    data={flowData}
                    onFinished = {this._onWorkFlowFinished}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
    }
});
