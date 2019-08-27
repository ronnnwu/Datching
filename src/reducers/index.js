import { NavigationActions } from 'react-navigation';
import { AsyncStorage } from 'react-native';
import { combineReducers } from 'redux';
import { RootNavigator } from '../navigations/AppNavigation';

import firebase from 'firebase';
import '@firebase/firestore';

// Start with two routes: The Main screen, with the Login screen on top.

const firstAction = RootNavigator.router.getActionForPathAndParams('LoadScreen');
const initialNavState = RootNavigator.router.getStateForAction(
  firstAction
);

function nav(state = initialNavState, action) {
  let nextState;
  switch (action.type) {
    case 'Login':
      nextState = RootNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'DrawerStack' }),
        state
      );
      break;
    case 'Logout':
      try {
          AsyncStorage.removeItem('@loggedInData:value');
          firebase.auth().signOut();
          nextState = RootNavigator.router.getStateForAction(
            NavigationActions.navigate({ routeName: 'LoginStack' }),
            state
          );
      } catch (e) {
        console.log(e);
      }
      break;
    default:
      nextState = RootNavigator.router.getStateForAction(action, state);
      break;
  }

  // Simply return the original `state` if `nextState` is null or undefined.
  return nextState || state;
}

const initialAuthState = { isLoggedIn: false };

function auth(state = initialAuthState, action) {
  switch (action.type) {
    case 'UPDATE_USER_DATA':
      return { ...state, isLoggedIn: true, user: { ...state.user , ...action.user }};
    case 'Logout':
      AsyncStorage.removeItem('@loggedInData:value');
      firebase.firestore().collection('users').doc(state.user.userID).update({ isOnline: false });
      return { ...state, isLoggedIn: false, user: {} };
    default:
      return state;
  }
}

const initialSettingsState = {
  selectedDistanceIndex: 2,
  selectedGenderIndex: 2,
  gender: '',
  maximumDistance: '',
  newMatches: false,
  messages: false,
  superLike: false,
  topPicks: false,
  showMe: false,
  isFromSignup: false,
  isProfileComplete: false
};

function appSettings(state = initialSettingsState, action) {
  switch (action.type) {
    case 'SHOW_ME':
      return(
    		Object.assign({}, state, {
        	showMe: action.value
    	  })
      );
    case 'NEW_MATCHES':
      return(
        Object.assign({}, state, {
          newMatches: action.value
        })
      );
    case 'MESSAGES':
      return(
        Object.assign({}, state, {
          messages: action.value
        })
      );
    case 'SUPER_LIKE':
      return(
        Object.assign({}, state, {
          superLike: action.value
        })
      );
    case 'TOP_PICKS':
      return(
        Object.assign({}, state, {
          topPicks: action.value
        })
      );
    case 'GENDER':
      return(
        Object.assign({}, state, {
          selectedGenderIndex: action.value,
          gender: action.value.gender
        })
      );
    case 'MAXIMUM_DISTANCE':
      return(
        Object.assign({}, state, {
          selectedDistanceIndex: action.value,
          maximumDistance: action.value.maximumDistance,
        })
      );
    case 'INITIALIZE_APP_SETTINGS':
      const settings = action.value.settings;
      return(
        Object.assign({}, state, {
          settings
        })
      );
      case 'IS_FROM_SIGNUP':
        return(
          Object.assign({}, state, {
            isFromSignup : action.value
          })
        );
      case 'IS_PROFILE_COMPLETE':
        return(
          Object.assign({}, state, {
            isProfileComplete : action.value
          })
        );
    default:
      return state;
  }
}


const AppReducer = combineReducers({
  nav,
  auth,
  appSettings
});

export default AppReducer;
