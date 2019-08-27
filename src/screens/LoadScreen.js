import React from 'react';
import { View, AsyncStorage, StyleSheet } from 'react-native';
import AppStyles from '../AppStyles';

class LoadScreen extends React.Component {
    static navigationOptions = {
        header: null
    };

    componentWillMount() {
      const { navigation } = this.props;

      AsyncStorage.getItem('@shouldShowWalkThrough:value', (err, result) => {
        if (result  !== null) {
          AsyncStorage.getItem('@loggedInData:value', (err, result) => {
            if (result  !== null) {
              navigation.dispatch({ type: 'UPDATE_USER_DATA', user: JSON.parse(result)});
              navigation.replace('DrawerStack');
            } else {
              navigation.replace('LoginStack');
            }

            if (err) {
              console.log(err);
            }
          });
        } else {
          navigation.replace('WorkThrough');
          AsyncStorage.setItem('@shouldShowWalkThrough:value', JSON.stringify({ value: 'true' }));
        }

        if (err) {
          console.log(err);
        }
      });
    }

    render() {
        return (
            <View style={styles.container} />
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppStyles.colorSet.mainThemeForegroundColor
    }
})

export default LoadScreen;
