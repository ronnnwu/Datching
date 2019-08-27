import React, { Component } from 'react';

import { Platform, StyleSheet, View, TouchableWithoutFeedback, Text, Dimensions, Animated, PanResponder } from 'react-native';
 
const SCREEN_WIDTH = Dimensions.get('window').width;
 
export default class SwipeableCardView extends React.Component
{
  constructor()
  {
    super();
 
    this.panResponder;
 
    this.state = { 
      
      Xposition: new Animated.Value(0), 

      RightText: false,

      LeftText: false, 
    
  }
 
    this.CardView_Opacity = new Animated.Value(1);
  }
 
  componentWillMount()
  {
    this.panResponder = PanResponder.create(
    {
      onStartShouldSetPanResponder: (evt, gestureState) => false,

      onMoveShouldSetPanResponder: (evt, gestureState) => true,
 
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
 
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
 
      onPanResponderMove: (evt, gestureState) =>
      {
        this.state.Xposition.setValue(gestureState.dx);
 
        if( gestureState.dx > SCREEN_WIDTH - 250 )
        {

          this.setState({ 
            
            RightText: true, 

            LeftText: false 
          });

        }
        else if( gestureState.dx < -SCREEN_WIDTH + 250 )
        {

          this.setState({ 

            LeftText: true, 

            RightText: false 

          });

        }
      },
 
      onPanResponderRelease: (evt, gestureState) =>
      {
        if( gestureState.dx < SCREEN_WIDTH - 150 && gestureState.dx > -SCREEN_WIDTH + 150 )
        {
          
          this.setState({ 

            LeftText: false,

            RightText: false 
            
          });
 
          Animated.spring( this.state.Xposition,
          {
            toValue: 0,
            speed: 5,
            bounciness: 10,
          }, { useNativeDriver: true }).start();
        }

        else if( gestureState.dx > SCREEN_WIDTH - 150 )
        {

          Animated.parallel(
          [          
            Animated.timing( this.state.Xposition,
            {
              toValue: SCREEN_WIDTH,
              duration: 200
            }),
 
            Animated.timing( this.CardView_Opacity,
            {
              toValue: 0,
              duration: 200
            })
          ], { useNativeDriver: true }).start(() =>
          {
            this.setState({ LeftText: false, RightText: false }, () =>
            {
              this.props.removeCardView();
            });
          }); 

        }
        else if( gestureState.dx < -SCREEN_WIDTH + 150 )
        {
          Animated.parallel(
          [          
            Animated.timing( this.state.Xposition,
            {
              toValue: -SCREEN_WIDTH,
              duration: 200
            }),
 
            Animated.timing( this.CardView_Opacity,
            {
              toValue: 0,
              duration: 200
            })
          ], { useNativeDriver: true }).start(() =>
          {
            this.setState({ LeftText: false, RightText: false }, () =>
            {
              this.props.removeCardView();
            });
          });          
        }
      }
    });
  }
 
  render()
  {
    const rotateCard = this.state.Xposition.interpolate(
    {
       inputRange: [-200, 0, 200],
       outputRange: ['-20deg', '0deg', '20deg'],
    });
 
    return(
      <Animated.View {...this.panResponder.panHandlers} 
        style = {[ 
          styles.cardView_Style, { backgroundColor: this.props.item.backgroundColor, 
          opacity: this.CardView_Opacity, 
          transform: [{ translateX: this.state.Xposition } ]
          // { rotate: rotateCard }]
        }]}
      >
        <Text style = { styles.CardView_Title }> { this.props.item.cardView_Title } </Text>
        {
          ( this.state.LeftText ) ? (<Text style = { styles.Left_Text_Style }> Left Swipe </Text>) : null
        }
        {
          ( this.state.RightText ) ? (<Text style = { styles.Right_Text_Style }> Right Swipe </Text>) : null 
        }
        <TouchableWithoutFeedback  onPress={() => this.props.detail()}>
        <View style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: 'transparent'}}/>
        </TouchableWithoutFeedback>
      </Animated.View>
    );
  }
}
const styles = StyleSheet.create(
  {
    MainContainer:
    {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: ( Platform.OS === 'ios' ) ? 20 : 0
    },
    cardView_Style:
    {
      width: '75%',
      height: '45%',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      borderRadius: 7
    },
    CardView_Title:
    {
      color: '#fff',
      fontSize: 24
    },
    Left_Text_Style:
    {
      top: 22,
      right: 32,
      position: 'absolute',
      color: '#fff',
      fontSize: 20,
      fontWeight: 'bold',
      backgroundColor: 'transparent'
    },
    Right_Text_Style:
    {
      top: 22,
      left: 32,
      position: 'absolute',
      color: '#fff',
      fontSize: 20,
      fontWeight: 'bold',
      backgroundColor: 'transparent'
    }
  });
  