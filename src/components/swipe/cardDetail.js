import React, { Component } from 'react';
import { Platform, StyleSheet, View, ScrollView, Text, TouchableOpacity, FlatList, Alert, Image } from 'react-native';
import Swiper from 'react-native-swiper';
// import FastImage from 'react-native-fast-image-expo';

import AppStyles from '../../AppStyles';
import { size } from '../../helpers/devices';
import {DEVICE_WIDTH, DEVICE_HEIGHT} from '../../helpers/statics';
import  BottomTabBar  from './bottom_tab_bar';

const tmpPhotos = [
    'https://pbs.twimg.com/profile_images/681369932207013888/CHESpTzF.jpg',
    'https://c1.staticflickr.com/6/5252/5403292396_0804de9bcf_b.jpg',
    'https://pbs.twimg.com/media/BduTxWnIUAAKT_5.jpg',
    'https://c1.staticflickr.com/8/7175/6698567177_fc5df89f18_b.jpg',
    'https://www.rd.com/wp-content/uploads/2017/03/02-People-Share-the-Random-Act-of-Kindness-That-Changed-Their-Life-Fatima-M-Woods-380x254.jpg',
    'https://image.yenisafak.com/resim/imagecrop/2017/07/06/04/46/resized_6d734-9adcf410maxresdefault.jpg',
    'https://c1.staticflickr.com/6/5252/5403292396_0804de9bcf_b.jpg',
    'https://pbs.twimg.com/media/BduTxWnIUAAKT_5.jpg',
    'https://c1.staticflickr.com/8/7175/6698567177_fc5df89f18_b.jpg',
];
const tmpBio = 'Moved from the East Coast & just want to meet some new people.';

export default class CardDetail extends React.Component {

  constructor(props) {
    super(props);
    const {firstName, age, school, distance, profilePictureURL, instagramPhotos, bio} = this.props;
    this.state={
        firstName,
        age,
        school,
        distance,
        profilePictureURL,
        bio,
        myPhotos: instagramPhotos ? [...instagramPhotos] : [profilePictureURL],
        instagramPhotos: instagramPhotos ? instagramPhotos : [],
    }
  }

  updatePhotos(photos) {
    let myphotos = [];
    let temp = [];
    if (photos.length > 0) {
      photos.map((item, index) => {
        temp.push(item);
        if(index % 6 == 5) {
          myphotos.push(temp);
          temp = [];
        }
      });

      myphotos.push(temp);
      this.setState({instagramPhotos: myphotos});
    }
  }

  componentWillMount() {
    const {instagramPhotos} = this.state;
    this.updatePhotos(instagramPhotos);
    this.swiperDotWidth = Math.floor(DEVICE_WIDTH/this.state.myPhotos.length) - 4;
  }

  onSwipe(direction) {
    this.props.onSwipe(direction);
    this.props.setShowMode(0);
  }

  render() {
    const {firstName, age, school, distance, bio, profilePictureURL, myPhotos, instagramPhotos} = this.state;
    return (
      <View style={{flex: 1}}>
        <ScrollView style={styles.body} bounces={false}>
          <View style={styles.photoView}>
            <Swiper style={styles.wrapper}
              showsButtons={false}
              loop={false}
              onIndexChanged={(index) => {}}
              paginationStyle={{top: 5, bottom: null}}
              dot={<View style={{backgroundColor:'rgba(0,0,0,.2)', width: this.swiperDotWidth, height: 4,borderRadius: 4, margin: 2}} />}
              activeDot={<View style={{backgroundColor: 'white', width: this.swiperDotWidth, height: 4, borderRadius: 4, margin: 2}} />}
            >
              {myPhotos.map((photos, i) => (
                <Image
                    key={'photos'+i}
                    style={styles.profilePhoto}
                    source={{uri: photos}}
                />
              ))}
            </Swiper>
          </View>
          <TouchableOpacity style={styles.backView} onPress={() => this.props.setShowMode(0)}>
            <Image
              style={styles.backIcon}
              source={AppStyles.iconSet.arrowdownIcon}
            />
          </TouchableOpacity>
          <View style={styles.titleView}>
            <Text style={styles.name}>{firstName}</Text>
            <Text style={styles.age}>{age}</Text>
          </View>
          <View style={styles.captionView}>
            <View style={styles.itemView}>
              <Image
                style={styles.icon}
                source={AppStyles.iconSet.schoolIcon}
              />
              <Text style={styles.text}>{school}</Text>
            </View>
            <View style={styles.itemView}>
              <Image
                style={styles.icon}
                source={AppStyles.iconSet.markerIcon}
              />
              <Text style={[styles.text, {marginLeft: 2}]}>{distance + ' miles away'}</Text>
            </View>
          </View>
          <View style={styles.lineView}/>
          <View style={styles.bioView}>
            <Text style={styles.bioText}>{bio}</Text>
          </View>
            {this.state.instagramPhotos.length > 0 && (
              <View style={styles.instagramView}>
                <View style={styles.itemView}>
                  <Text style={[styles.label,  {fontWeight: 'bold'}]}>Recent Instagram Photos</Text>
                </View>
                <Swiper
                  showsButtons={false}
                  loop={false}
                  paginationStyle={{top: -240, left: null, right: 0}}
                  dot={<View style={{backgroundColor:'rgba(0,0,0,.2)', width: 8, height: 8,borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3,}} />}
                  activeDot={<View style={{backgroundColor: '#db6470', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3,}} />}
                >
                  {instagramPhotos.map((photos, i) => (
                    <View key={'photos'+i} style={styles.slide}>
                      <FlatList
                      horizontal={false}
                      numColumns={3}
                      data={photos}
                      scrollEnabled={false}
                      renderItem={({item, index}) => (
                          <TouchableOpacity
                              key={'item'+index}
                              style={styles.myphotosItemView}
                              // onPress={() => this.onSelectDelPhoto(i*6+index)}
                          >
                              <Image
                              style={{width: '100%', height: '100%'}}
                              source={{uri: item}}
                              />
                          </TouchableOpacity>
                      )}
                      />
                    </View>
                  ))}
                </Swiper>
              </View>
            )}
          <View style={{height: 95}} />
        </ScrollView>
        <View style={{flex: 1, width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)', alignSelf: 'center', alignItems: 'center', position: 'absolute', bottom: 0}}>
          <BottomTabBar
            isDone={this.props.isDone}
            // onRewindPressed={() => console.log('rewind pressed')}
            onDislikePressed={() => this.onSwipe('left')}
            onSuperLikePressed={() => this.onSwipe('superlike')}
            onLikePressed={() => this.onSwipe('right')}
            // onBoostPressed={() => console.log('boost pressed')}
            containerStyle={{ width: '58%'}}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
    topemptyView: {
      width: '100%', height: Platform.OS === "ios" ? 50 : 0,
      backgroundColor: '#c2c2c2'
    },
    photoView: {
      width: '100%',
      // marginTop: 30,
      // height: 400,
      height: DEVICE_HEIGHT * 0.50,
      backgroundColor: 'skyblue'
    },
    profilePhoto: {
        width: '100%',
        height: '100%'
    },
    backView: {
      position: 'absolute',
      top: DEVICE_HEIGHT * 0.467,
      right: 20,
      width: 55,
      height: 55,
      borderRadius: 27.5,
      backgroundColor: '#db6470',
      justifyContent: 'center',
      alignItems: 'center'
    },
    backIcon: {
      width: 30,
      height: 30,
      resizeMode: 'contain',
      tintColor: 'white'
    },
    titleView: {
      width: '100%',
      paddingHorizontal: 12,
      marginVertical: 20,
      // marginTop: 5,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
    },
      name: {
        fontSize: 30,
        fontWeight: 'bold',
        marginRight: 10
      },
      age: {
        bottom: 1,
        fontSize: 25
      },
    captionView: {
      width: '100%',
      paddingHorizontal: 12,
    },
      itemView: {
        width: '100%',
        paddingVertical: 2,
        marginVertical: 2,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
      },
        icon: {
            width: size(20),
            height: size(20),
            tintColor: 'grey'
        },
        text: {
          paddingLeft: size(10),
          fontSize: size(16),
          color: '#595959',
          backgroundColor: 'transparent',
        },
    lineView: {
      marginTop: 4,
      width: '100%', height: 1,
      backgroundColor: AppStyles.colorSet.hairlineColor,
    },
    bioView: {
      width: '100%',
      paddingHorizontal: 12,
      marginVertical: 15,
    },
    label: {
      fontSize: size(20),
    },
    bioText: {
      fontSize: size(16),
      color: '#595959'
    },
    instagramView: {
      width: '100%',
      height: 270,
      paddingHorizontal: 12,
    },
        slide: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        myphotosItemView: {
          width: 100, height: 100,
          marginHorizontal: 8,
          marginVertical: 8,
          borderRadius: 15,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'grey',
          overflow: 'hidden'
        },
        instagramItemView: {
          width: 100, height: 100,
          marginHorizontal: 5,
          marginVertical: 5,
          borderRadius: 15,
          backgroundColor: 'grey'
        }
});
