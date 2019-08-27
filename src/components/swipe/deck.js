import React,{ Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Animated,
  Platform,
  Modal,
  PanResponder,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity 
} from 'react-native';
import Interactable from 'react-native-interactable';
import  BottomTabBar  from './bottom_tab_bar';
import AppStyles from '../../AppStyles';

import { size } from '../../helpers/devices';
import * as Statics from '../../helpers/statics';

const SCREEN_HEIGHT = Statics.DEVICE_HEIGHT;
const SCREEN_WIDTH = Statics.DEVICE_WIDTH;
const SWIPE_THRESHOLD = 0.75 * Statics.DEVICE_WIDTH;

const transformValue = Platform.select({ ios: '10deg', android: '5deg' });

export default class Deck2 extends Component {
  static propTypes = {
    onSwipeLeft: PropTypes.func,
    onSwipeRight: PropTypes.func,
    data: PropTypes.array.isRequired,
    renderCard: PropTypes.func.isRequired,
    renderCardDetail: PropTypes.func.isRequired,
    renderNoMoreCards: PropTypes.func.isRequired,
  }

  static defaultProps = {
    onSwipeLeft: () => {},
    onSwipeRight: () => {},
  }

  constructor(props) {
    super(props);
    this.position = new Animated.ValueXY()
    this.state = {
      position: this.position,
      index: 0,
      isDone: false
    }

    this.rotate = this.position.x.interpolate({
      inputRange: [-SWIPE_THRESHOLD / 2, 0, SWIPE_THRESHOLD / 2],
      outputRange: ['-10deg', '0deg', '10deg'],
      extrapolate: 'clamp'
    })

    this.rotateAndTranslate = {
      transform: [{
        rotate: this.rotate
      },
      ...this.position.getTranslateTransform()
      ]
    }

    this.likeOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp'
    })
    this.dislikeOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0, 0],
      extrapolate: 'clamp'
    })

    this.nextCardOpacity = this.position.x.interpolate({
      inputRange: [-SWIPE_THRESHOLD / 2, 0, SWIPE_THRESHOLD / 2],
      outputRange: [1, 0, 1],
      extrapolate: 'clamp'
    })
    this.nextCardScale = this.position.x.interpolate({
      inputRange: [-SWIPE_THRESHOLD / 2, 0, SWIPE_THRESHOLD / 2],
      outputRange: [1, 0.8, 1],
      extrapolate: 'clamp'
    })

  }

  componentWillMount() {
    this.PanResponder = PanResponder.create({

      // onStartShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => { 
                    return !(gestureState.dx === 0 && gestureState.dy === 0)                  
      },
      onPanResponderMove: (evt, gestureState) => {

        this.position.setValue({ x: gestureState.dx, y: gestureState.dy })
      },
      onPanResponderRelease: (evt, gestureState) => {

        if (gestureState.dx > 120) {
          Animated.spring(this.position, {
            toValue: { x: SWIPE_THRESHOLD + 100, y: gestureState.dy }
          }).start(() => {
            this.setState({ index: this.state.index + 1 }, () => {
              this.position.setValue({ x: 0, y: 0 })
            })
          })
        }
        else if (gestureState.dx < -120) {
          Animated.spring(this.position, {
            toValue: { x: -SWIPE_THRESHOLD - 100, y: gestureState.dy }
          }).start(() => {
            this.setState({ index: this.state.index + 1 }, () => {
              this.position.setValue({ x: 0, y: 0 })
            })
          })
        }
        else {
          Animated.spring(this.position, {
            toValue: { x: 0, y: 0 },
            friction: 4
          }).start()
        }
      }
    })
  }


  componentWillReceiveProps(props) {
    if (props.data !== this.props.data) {
      console.log('componentWillReceiveProps', props.data);
      this.setState({
        index: 0,
        isDone: false
      });
    }
  }

  onSwipeComplete(direction) {
    const { data } = this.props;
    const item = data[this.state.index]

    if (this.state.index <= this.props.data.length - 1) {
      // if (direction === 'left') {
      //   this.refs.test.snapTo({index: 2})
      // } else {
      //   this.refs.test.snapTo({index: 0})
      // }
      this.props.onSwipe(direction, item);
    }
  }

  controlCardLeaving(event) {
    const { onSwipeLeft, onSwipeRight, data} = this.props;
    const item = data[this.state.index]

    if (event.left === 'enter') {
      onSwipeLeft(item);
      this.state.position.setValue(0);
      this.setState({
        index: this.state.index + 1
      });
    } else if (event.right === 'enter') {
      onSwipeRight(item);
      this.state.position.setValue(0);
      this.setState({
        index: this.state.index + 1
      });
    } else {
      console.log('else');
    }
  }

  renderCards() {
    const {index, position} = this.state;
    const {renderCard, renderNoMoreCards, data} = this.props;
    if (index >= data.length) {
      return (
        <View style={styles.noMoreCards}>
           {renderNoMoreCards()}
        </View>);
        // this.setState({isDone: true})
    }
    else {
      return data.map((item, i) => {
        const androidStyle = {
          elevation: -i * 10,
        }
        if (i < index) { return null; }

        if (i === index) {

              console.log('Xxxxxxxxxxxxxxxx',item.profilePictureURL)
          return (
            <Animated.View
            {...this.PanResponder.panHandlers}
            key={item.id} style={[this.rotateAndTranslate, styles.cardStyle, androidStyle, {zIndex: 1000} ]}>
              <Animated.View style={{ opacity: this.likeOpacity, transform: [{ rotate: '-30deg' }], position: 'absolute', top: 50, left: 40, zIndex: 1000 }}>
                <Text style={{ borderWidth: 1, borderColor: 'green', color: 'green', fontSize: 32, fontWeight: '800', padding: 10 }}>LIKE</Text>

              </Animated.View>

              <Animated.View style={{ opacity: this.dislikeOpacity, transform: [{ rotate: '30deg' }], position: 'absolute',  top: 50, right: 40, zIndex: 1000 }}>
                <Text style={{ borderWidth: 1, borderColor: 'red', color: 'red', fontSize: 32, fontWeight: '800', padding: 10 }}>NOPE</Text>

              </Animated.View>  
              {renderCard(item)}  
            </Animated.View>

            // <Animated.View
            //   ref = {'test'}
            //   style={[styles.cardStyle, androidStyle]}
            //   key={item.userID}
            //   snapPoints={[
            //     {x: 390},
            //     {x: 0, damping: 0.7},
            //     {x: -390}
            //   ]}
            //   animatedValueX={position}
            //   onAlert={(event) => this.controlCardLeaving(event.nativeEvent)}
            //   alertAreas={[{id: 'right', influenceArea: {left: SWIPE_THRESHOLD}}, {id: 'left', influenceArea: {right:-SWIPE_THRESHOLD}}]}
            // >

            //   <Animated.View key={item.userID} style={[{marginBottom: 100}, {
            //     transform: [{
            //       rotate: position.x.interpolate({
            //         inputRange: [-300, 0, 300],
            //         outputRange: [`-${transformValue}`, '0deg', transformValue]
            //       })
            //     }]
            //   }]}>
            //       {renderCard(item)}
            //   </Animated.View>
            // </Animated.View>
        )}
        return (
          <Animated.View

          key={item.id} style={[{
            opacity: this.nextCardOpacity,
            transform: [{ scale: this.nextCardScale }], 
          },styles.cardStyle, androidStyle]}>
          <Animated.View style={{ opacity: 0, transform: [{ rotate: '-30deg' }], position: 'absolute',  top: 50, left: 40, zIndex: 1000 }}>
            <Text style={{ borderWidth: 1, borderColor: 'green', color: 'green', fontSize: 32, fontWeight: '800', padding: 10 }}>LIKE</Text>

          </Animated.View>

          <Animated.View style={{ opacity: 0, transform: [{ rotate: '30deg' }], position: 'absolute',  top: 50, right: 40, zIndex: 1000 }}>
            <Text style={{ borderWidth: 1, borderColor: 'red', color: 'red', fontSize: 32, fontWeight: '800', padding: 10 }}>NOPE</Text>

          </Animated.View>

          {renderCard(item)}

        </Animated.View>
          // <Animated.View
          //     style={[styles.cardStyle, androidStyle]}
          //     key={item.userID}
          //     horizontalOnly={false}
          //     animatedValueX={position}
          //   >
          //   <Animated.View key={item.userID} style={[styles.cardStyle, androidStyle]}>
          //     {renderCard(item)}
          //   </Animated.View>
          // </Animated.View>
        );
      }).reverse();
    }
  }

  renderBottomTabBar(containerStyle, buttonContainerStyle) {
    const {isDone} = this.state;
    return (
      <View style={{ marginBottom: -8}}>
        <BottomTabBar
          isDone={isDone}
          // onRewindPressed={() => console.log('rewind pressed')}
          onDislikePressed={() => this.onSwipeComplete('left')}
          onSuperLikePressed={() => this.onSwipeComplete('superlike')}
          onLikePressed={() => this.onSwipeComplete('right')}
          // onBoostPressed={() => console.log('boost pressed')}
          containerStyle={containerStyle}
          buttonContainerStyle={buttonContainerStyle}
        />
      </View>
    );
  }

  render() {
    const {index} = this.state;
    const {showMode, renderCardDetail, data, renderNewMatch} = this.props;
    return (
      <View style={styles.container}>
        {this.renderCards()}
        {showMode == 1 && data[index] &&
          <Modal visible={this.state.isDialogVisible} animationType={'slide'} >
            <View style={styles.cardDetailContainer}>
              <View style={styles.cardDetailL}>
                {renderCardDetail(data[index], this.state.isdone)}
              </View>
            </View>
          </Modal>
        }
        {this.renderBottomTabBar()}
        {showMode == 2 &&
        <Modal animationType={'fade'} transparent={false} visible={ showMode == 2 ? true : false } animationType={'slide'} >
          <View style={styles.newMatch}>
            {renderNewMatch()}
          </View>
        </Modal>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({  
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardStyle: {
    position: 'absolute',
    top: 0,
    bottom: 50,
    left: 0,
    right: 0,
    width: Statics.DEVICE_WIDTH,
  },
  cardDetailContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  cardDetailL: {
    // position: 'absolute',
    // bottom: 0,
    width: Statics.DEVICE_WIDTH,
    height: Statics.DEVICE_HEIGHT * 0.95,
    // paddingBottom: size(100),
    backgroundColor: 'white'
  },
  newMatch: {
    // position: 'absolute',
    // bottom: 0,
    width: Statics.DEVICE_WIDTH,
    height: Statics.DEVICE_HEIGHT,
    backgroundColor: 'white'
  },
  noMoreCards: {
    position: 'absolute',
    top: 0,
    bottom: 50,
    left: 0,
    right: 0,
    width: Statics.DEVICE_WIDTH,
  },
  overlay: {
    position: 'absolute',
    bottom: 180,
    left: 25,
    right: 0,
    top: 30,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    elevation: 100,
    zIndex: 100,
  },
  overlay_nope: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 25,
    top: 30,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    elevation: 100,
    zIndex: 100,
  },
  overlayText: {
    fontSize: 40,
    color: 'white',
    fontWeight: '600',
    padding: 3,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  buttons_container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button_style: {
    padding: 20,
  },
});
