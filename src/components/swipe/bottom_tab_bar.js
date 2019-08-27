import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { size } from '../../helpers/devices';
import AppStyles from '../../AppStyles';

export default class BottomTabBar extends Component {
  constructor(props) {
    super(props);
    this.scaleValue1 = new Animated.Value(0);
    this.scaleValue2 = new Animated.Value(0);
    this.scaleValue3 = new Animated.Value(0);
    this.scaleValue4 = new Animated.Value(0);
    this.scaleValue5 = new Animated.Value(0);
    this.onRewindPress = this.onRewindPress.bind(this);
    this.onDislikePress = this.onDislikePress.bind(this);
    this.onSuperLikePress = this.onSuperLikePress.bind(this);
    this.onLikePress = this.onLikePress.bind(this);
    this.onBoostPress = this.onBoostPress.bind(this);
    this.state={}
  }

  componentWillReceiveProps(props) {
    console.log('PRops', props);
  }

  scaleButton() {
    Animated.timing(
        this.scaleValue,
        {
          toValue: 1,
          duration: 300,
          easing: Easing.easeOutBack
        }
    ).start(() => {});
  }

  onRewindPress() {
    this.scaleValue1.setValue(0);
    Animated.timing(
      this.scaleValue1,
      {
        toValue: 1,
        duration: 300,
        easing: Easing.easeOutBack
      }
  ).start(() => {});
    this.props.onRewindPressed();
  }

  onDislikePress() {
    this.scaleValue2.setValue(0);
    Animated.timing(
      this.scaleValue2,
      {
        toValue: 1,
        duration: 300,
        easing: Easing.easeOutBack
      }
  ).start(() => {});
    this.props.onDislikePressed();
  }

  onSuperLikePress() {
    this.scaleValue3.setValue(0);
    Animated.timing(
      this.scaleValue3,
      {
        toValue: 1,
        duration: 300,
        easing: Easing.easeOutBack
      }
    ).start(() => {});
    this.props.onSuperLikePressed();
  }

  onLikePress() {
    this.scaleValue4.setValue(0);
    Animated.timing(
      this.scaleValue4,
      {
        toValue: 1,
        duration: 300,
        easing: Easing.easeOutBack
      }
  ).start(() => {});
    this.props.onLikePressed();
  }

  onBoostPress() {
    this.scaleValue5.setValue(0);
    Animated.timing(
      this.scaleValue5,
      {
        toValue: 1,
        duration: 300,
        easing: Easing.easeOutBack
      }
  ).start(() => {});
    this.props.onBoostPressed();
  }

  getCardStyle1() {
    const scale = this.scaleValue1.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.7, 1]
    });
      return {
        transform: [{ scale }]
      };
  }

  getCardStyle2() {
    const scale = this.scaleValue2.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.7, 1]
    });
      return {
        transform: [{ scale }]
      };
  }

  getCardStyle3() {
    const scale = this.scaleValue3.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.7, 1]
    });
      return {
        transform: [{ scale }]
      };
  }

  getCardStyle4() {
    const scale = this.scaleValue4.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.7, 1]
    });
      return {
        transform: [{ scale }]
      };
  }

  getCardStyle5() {
    const scale = this.scaleValue5.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.7, 1]
    });
      return {
        transform: [{ scale }]
      };
  }

  render() {
    return (
      <View style={[styles.container, this.props.containerStyle]}>
          <TouchableWithoutFeedback onPress={this.onDislikePress}>
            <Animated.View style={[styles.button_container, this.getCardStyle2(), this.props.buttonContainerStyle]}>
              <Image source={AppStyles.iconSet.crossFilled} style={[styles.large_icon, {tintColor: '#e8315b'}]}/>
            </Animated.View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={this.onSuperLikePress}>
            <Animated.View style={[styles.button_container, this.getCardStyle3()]}>
              <Image source={AppStyles.iconSet.starFilled} style={styles.small_icon}/>
            </Animated.View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={this.onLikePress}>
            <Animated.View style={[styles.button_container, this.getCardStyle4()]}>
                <Image source={AppStyles.iconSet.Like} style={[styles.large_icon, {tintColor: '#44d48c'}]}/>
            </Animated.View>
          </TouchableWithoutFeedback>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    margin: size(10),
    marginHorizontal: size(40),
    marginBottom: size(35),
  },
  button_container: {
    padding: size(15),
    backgroundColor: 'white',
    borderRadius: 30,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    overflow: 'hidden'
  },
  small_icon: {
    width: size(23),
    height: size(23),
    resizeMode: 'contain',
    tintColor: '#3c94dc'
  },
  large_icon: {
    width: size(33),
    height: size(33),
    resizeMode: 'contain',
  },
})
