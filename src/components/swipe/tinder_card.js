import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity
} from 'react-native';
import { size } from '../../helpers/devices';
import * as Statics from '../../helpers/statics';
import AppStyles from '../../AppStyles';
// import FastImage from 'react-native-fast-image-expo';
import Icon from 'react-native-vector-icons/Octicons';

export default class TinderCard extends Component {
  render() {
    const { url, name, age, school, distance } = this.props;

    return (
      <View style={styles.container}>
        <ImageBackground
          source={{ uri: url}}
          style={styles.news_image_style}
        >
          <ImageBackground
            style={styles.name_info_container}
            source={AppStyles.iconSet.BackgroundLayer}
          >
            <Text style={styles.name_style}>{name}, {age}</Text>
            <View style={styles.txtBox}>
              <Image
                style={styles.icon}
                source={AppStyles.iconSet.schoolIcon}
              />
              <Text style={styles.label}>{school}</Text>
            </View>
            <View style={styles.txtBox}>
              <Image
                style={styles.icon}
                source={AppStyles.iconSet.markerIcon}
              />
              <Text style={styles.label}>{distance + (distance==1 ? ' mile' : ' miles') + ' away'}</Text>
            </View>
          </ImageBackground>
          <TouchableOpacity
              style={styles.detailBtn}
              onPress={()=>this.props.setShowMode(1)}
            >
          </TouchableOpacity>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  news_image_style: {
    width: Statics.DEVICE_WIDTH - size(25),
    height: Statics.DEVICE_HEIGHT * .68, // FIX ME ITS BAD
    flexDirection: 'column',
    justifyContent: 'flex-end',
    marginHorizontal: size(10),
    marginTop: size(10),
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'white'
  },
  name_info_container: {
    padding: size(20),
  },
  name_style: {
    fontSize: size(24),
    fontWeight: '700',
    color: 'white',
    marginBottom: size(5),
    backgroundColor: 'transparent',
  },
  txtBox: {
    marginTop: size(3),
    flexDirection: 'row'
  },
  icon: {
    width: size(20),
    height: size(20),
    tintColor: 'white'
  },
  label: {
    paddingLeft: size(10),
    fontSize: size(16),
    fontWeight: '400',
    color: 'white',
    backgroundColor: 'transparent',
  },
  detailBtn: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  detailIcon: {
    padding: size(5),
  }
});
