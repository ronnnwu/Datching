import { Animated, Easing, StyleSheet } from 'react-native';
import { createStackNavigator, createDrawerNavigator } from 'react-navigation';
import { createReactNavigationReduxMiddleware, reduxifyNavigator } from 'react-navigation-redux-helpers';
import { connect } from 'react-redux';
import AppStyles from '../AppStyles';
import DrawerContainer from '../components/DrawerContainer';
import ChatScreen from '../screens/ChatScreen';
import LoadScreen from '../screens/LoadScreen';
import SearchScreen from '../screens/SearchScreen';
import FriendsScreen from '../screens/FriendsScreen';
import SwipeScreen from '../screens/SwipeScreen';
import ProfileSettingScreen from '../screens/ProfileSettingScreen';
import AddprofileScreen from '../screens/AddprofileScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingScreen from '../screens/SettingScreen';
import ContactScreen from '../screens/ContactScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import WorkThroughScreen from '../screens/WorkThroughScreen';

const noTransitionConfig = () => ({
    transitionSpec: {
        duration: 0,
        timing: Animated.timing,
        easing: Easing.step0
    }
})

const middleware = createReactNavigationReduxMiddleware(
    'root',
    state => state.nav
);

// login stack
const LoginStack = createStackNavigator({
    Welcome: { screen: WelcomeScreen },
    Login: { screen: LoginScreen },
    Signup: { screen: SignupScreen }
}, {
        initialRouteName: 'Welcome',
        headerMode: 'float',
        navigationOptions: ({ navigation }) => ({
            headerTintColor: '#464646',
            headerTitleStyle: styles.headerTitleStyle,
            gesturesEnabled: false,
            headerStyle: {
                borderBottomWidth: 0,
            }
        }),
        cardStyle: { backgroundColor: '#FFFFFF' },
    }
);

const HomeStack = createStackNavigator({
    Swipe: { screen: SwipeScreen },
    Home: { screen: HomeScreen },
    Chat: { screen: ChatScreen },
    ProfileSetting: { screen: ProfileSettingScreen },
    Addprofile: { screen: AddprofileScreen },
    Profile: { screen: ProfileScreen },
    Setting: { screen: SettingScreen },
    Contact: { screen: ContactScreen },
}, {
        initialRouteName: 'Swipe',
        headerMode: 'float',
        headerLayoutPreset: 'center',
        navigationOptions: ({ navigation }) => ({
            headerTintColor: AppStyles.colorSet.mainThemeForegroundColor,
            headerTitleStyle: styles.headerTitleStyle,
            header: null,
            gesturesEnabled: false,
        }),
        cardStyle: { backgroundColor: '#FFFFFF' },
    }
);

const FriendsStack = createStackNavigator({
    Friends: { screen: FriendsScreen },
}, {
        initialRouteName: 'Friends',
        headerMode: 'float',
        headerLayoutPreset: 'left',
        navigationOptions: ({ navigation }) => ({
            headerTintColor: AppStyles.colorSet.mainThemeForegroundColor,
            headerTitleStyle: styles.headerTitleStyle,
        }),
        cardStyle: { backgroundColor: '#FFFFFF' },
    }
);

const SearchStack = createStackNavigator({
    Search: { screen: SearchScreen },
}, {
        initialRouteName: 'Search',
        headerMode: 'float',
        headerLayoutPreset: 'left',
        navigationOptions: ({ navigation }) => ({
            headerTintColor: AppStyles.colorSet.mainThemeForegroundColor,
            headerTitleStyle: styles.headerTitleStyle,
        }),
        cardStyle: { backgroundColor: '#FFFFFF' },
    }
);

// drawer stack
const DrawerStack = createDrawerNavigator({
    HomeStack: HomeStack,
    FriendsStack: FriendsStack,
    SearchStack: SearchStack,
}, {
        drawerPosition: 'left',
        initialRouteName: 'HomeStack',
        drawerWidth: 200,
        contentComponent: DrawerContainer
    })

// Manifest of possible screens
const RootNavigator = createStackNavigator({
    LoadScreen: { screen: LoadScreen },
    WorkThrough: { screen: WorkThroughScreen },
    LoginStack: { screen: LoginStack },
    DrawerStack: { screen: DrawerStack }
}, {
        // Default config for all screens
        headerMode: 'none',
        initialRouteName: 'LoadScreen',
        transitionConfig: noTransitionConfig,
        navigationOptions: ({ navigation }) => ({
            color: 'black',
            gesturesEnabled: false,
        })
    })

const AppWithNavigationState = reduxifyNavigator(RootNavigator, 'root');

const mapStateToProps = state => ({
    state: state.nav,
});

const AppNavigator = connect(mapStateToProps)(AppWithNavigationState);

const styles = StyleSheet.create({
    headerTitleStyle: {
        fontWeight: 'bold',
        textAlign: 'center',
        alignSelf: 'center',
        color: 'black',
        flex: 1,
    },
})

export { RootNavigator, AppNavigator, middleware };
