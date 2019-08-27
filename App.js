import React from 'react';
import { AppRegistry, YellowBox } from 'react-native';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

import AppReducer from './src/reducers';
import { AppNavigator, middleware } from './src/navigations/AppNavigation';
import SplashScreen from 'react-native-splash-screen';

import * as firebase from 'firebase'; 
import { firebaseConfig } from './config';
firebase.initializeApp(firebaseConfig)

const store = createStore(AppReducer, applyMiddleware(middleware));

class App extends React.Component {
  componentWillMount() {
    YellowBox.ignoreWarnings(['Remote Debugger']);
    console.disableYellowBox = true;
  }

  componentDidMount() {
    //SplashScreen.hide();
  }

  render() {
    return (
      <Provider store={store}>
        <AppNavigator/>
      </Provider> 
    );
  }
}

AppRegistry.registerComponent('App', () => App);

export default App;
