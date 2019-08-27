import React from 'react';
import { Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native';

export default class MenuButton extends React.Component {
  constructor(props){
    super(props);
  }

  render() {
    return (
      <TouchableHighlight onPress={this.props.onPress }
        style={styles.btnClickContain} underlayColor="rgba(128, 128, 128, 0.1)">
        <View style={styles.btnContainer}>
          <View style={styles.imgCover}>
            <Image
              source={this.props.source}
              style={styles.btnIcon}
            />
          </View>
          <Text style={styles.btnText}>
            {this.props.title}
          </Text>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  btnClickContain: {
    flexDirection: 'row',
    padding: 5,
    marginTop: 5,
    marginBottom: 5,
  },
  btnContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imgCover: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnIcon: {
    tintColor: 'black',
    height: 20,
    width: 20,
  },
  btnText: {    
    fontSize: 16,
    marginLeft: 15,
  }
})