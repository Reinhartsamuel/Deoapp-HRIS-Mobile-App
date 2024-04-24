// ** React
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Image, Platform, StatusBar } from "react-native";

// ** Expo
import { Asset } from "expo-asset";
import * as Notifications from 'expo-notifications';
import * as SplashScreen from "expo-splash-screen";
import { enableScreens } from "react-native-screens";

// ** Galio
import { Block, GalioProvider } from "galio-framework";

// ** React Navigation
import { NavigationContainer } from "@react-navigation/native";
import Screens from "./navigations";


// Before rendering any navigation stack
enableScreens();

// ** Assets
import { Images, materialTheme } from "./constants/";
import { registerForPushNotificationsAsync } from "./services/notification";

import * as Sentry from "@sentry/react-native";

const assetImages = [Images?.Profile, Images?.Avatar];

function cacheImages(images) {
  return images.map((image) => {
    if (typeof image === "string") {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

SplashScreen.preventAutoHideAsync();
StatusBar.setBarStyle('dark-content');

if (Platform.OS === 'android') {
  StatusBar.setTranslucent(true);
  StatusBar.setBackgroundColor('transparent');
}




Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});



function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  // console.log(myDeviceToken)


  Sentry.init({
    dsn: "https://24fdb02c4564f235368c654777eebed4@o1121849.ingest.sentry.io/4506374968573952",
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production.
    tracesSampleRate: 1.0,
  });
  


  useEffect(() => {
    async function prepare() {
      try {
        //Load Resources
        await _loadResourcesAsync();
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }


    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      console.log("token notif", token);
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    prepare();




    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };

  }, []);



  const _loadResourcesAsync = async () => {
    return Promise.all([...cacheImages(assetImages)]);
  };

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);


  // useEffect(() => {
  //   setTimeout(() => SplashScreen.hideAsync(), 2000);
  // }, []);

  if (!appIsReady) {
    return null;
  }


  return (
    <NavigationContainer onReady={onLayoutRootView}>
      <GalioProvider theme={materialTheme}>
        <Block flex>
          {Platform.OS === "ios" && <StatusBar barStyle="default" />}
          <Screens />
        </Block>
      </GalioProvider>
    </NavigationContainer>
  );
}


export default Sentry.wrap(App);