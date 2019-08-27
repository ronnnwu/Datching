import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Image
} from 'react-native';
import { size } from '../../helpers/devices';
import AppStyles from '../../AppStyles';
// import FastImage from 'react-native-fast-image-expo';
import Button from 'react-native-button';

export default class NewMatch extends Component {
  render() {
    const { url, onSendMessage, onKeepSwiping } = this.props;

    return (
      <Image
        source={{uri: url}}
        style={styles.container}
      >
        <Text style={styles.name_style}>{"IT'S A MATCH!"}</Text>
        <Button containerStyle={styles.button} style={styles.label}
            onPress={onSendMessage}>
            SEND A MESSAGE
        </Button>
        <TouchableOpacity
          style={styles.detailBtn}
          onPress={onKeepSwiping}
        >
          <Text style={styles.label}>KEEP SWIPING</Text>
        </TouchableOpacity>
      </Image>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  name_style: {
    fontSize: size(45),
    fontWeight: 'bold',
    color: '#09EE8F',
    marginBottom: size(55),
    backgroundColor: 'transparent',
  },
  button: {
    width: '85%',
    backgroundColor: AppStyles.colorSet.mainThemeForegroundColor,
    borderRadius: 12,
    padding: 15,
    marginBottom: size(15),
  },
  label: {
    fontSize: size(18),
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: 'transparent',
  },
  detailBtn: {
    marginBottom: size(75),
  }
});
