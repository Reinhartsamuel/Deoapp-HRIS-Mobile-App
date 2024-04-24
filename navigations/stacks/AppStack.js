import React, { useEffect, useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Icon } from '../../components';
import SignInScreen from "../../screens/Authentication/SignIn";
import { materialTheme } from '../../constants';
import MainStack from './MainStack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../configs/firebase';
// import useAuthStore from '../../store/user';
import * as Location from 'expo-location';
import useLocationStore from '../../store/location';
import ForgotPassword from '../../screens/Authentication/ForgotPassword';

const Stack = createNativeStackNavigator();

function AppStack(props) {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  // const { setUserCredentials } = useAuthStore();
  const [status, requestPermission] = Location.useForegroundPermissions();
  const { setLatitude, setLongitude } = useLocationStore();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setIsLoggedIn(true);
      // setUserCredentials(user);
    } else {
      setIsLoggedIn(false);
    }
  });

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation
        });
        console.log("setting latitude to store", location?.coords?.latitude)
        console.log("setting longitude to store", location?.coords?.longitude)
        setLatitude(location?.coords?.latitude);
        setLongitude(location?.coords?.longitude);
      } catch (error) {
        console.log("error fetching location", error);
      };
    };

    requestPermission();
    fetchLocation();
  }, []);

  return (
    <Stack.Navigator
      initialRouteName="Profile"
      screenOptions={{
        mode: "card",
        headerShown: "screen",
      }}
    >
      {!isLoggedIn ? (
      // {false ? (
        <>
          <Stack.Screen
            name="Sign In"
            component={SignInScreen}
            options={{
              headerShown: false,
              drawerIcon: ({ focused }) => (
                <Icon
                  size={16}
                  name="ios-log-in"
                  family="ionicon"
                  color={focused ? "white" : materialTheme.COLORS.MUTED}
                />
              ),
            }}
          />
          <Stack.Screen
            name="Forgot Password"
            component={ForgotPassword}
            options={{
              headerShown: false,
              drawerIcon: ({ focused }) => (
                <Icon
                  size={16}
                  name="ios-log-in"
                  family="ionicon"
                  color={focused ? "white" : materialTheme.COLORS.MUTED}
                />
              ),
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={MainStack}
            options={{
              headerShown: false,
              drawerIcon: ({ focused }) => (
                <Icon
                  size={16}
                  name="ios-log-in"
                  family="ionicon"
                  color={focused ? "white" : materialTheme.COLORS.MUTED}
                />
              ),
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default AppStack