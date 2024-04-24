import React, { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Icon } from '../../components';
import { Images, materialTheme } from '../../constants';
import CustomDrawerContent from '../Menu';
import { auth } from '../../configs/firebase';
import { Alert, Dimensions } from 'react-native';
import HomeStack from './HomeStack';
import CoursesStack from './CoursesStack';
import useAuthStore from '../../store/user';
import axios from 'axios';
import { getCollectionFirebase, getSingleDocumentFirebase } from '../../apis/firebaseApi';
import SettingsStack from './SettingsStack';
import { getDataObject } from '../../services/asyncStorage';

const { width } = Dimensions.get("screen");
const Drawer = createDrawerNavigator();

const profile = {
  avatar: auth.currentUser ? auth.currentUser?.photoURL : Images.dummyAvatar,
  name: auth.currentUser?.displayName,
  type: "Seller",
  plan: "Pro",
  email: auth.currentUser?.email,
  rating: 4.8,
};


function MainStack(props) {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const setUserData = useAuthStore(state => state.setUserData);
  const userData = useAuthStore(state => state.userData);
  const setUserCredentials = useAuthStore(state => state.setUserCredentials);



  const getUserData = async () => {
    const userDataFromStorage = await getDataObject("userData");

    if (!userDataFromStorage) {
      console.log("running get userdata...")
      let dataCompany;
      let resultUser;
      let resultProjects;
      let companies;

      try {
        const conditions = [
          {
            field: 'users',
            operator: 'array-contains',
            value: auth.currentUser.uid
          },
        ];

        const sortBy = null;
        const limitValue = null;
        const startAfterData = null;

        companies = await getCollectionFirebase('companies', { conditions }, { sortBy }, { limitValue }, { startAfterData });
      } catch (error) {
        Alert.alert(error.message);
      } finally {
        setLoading(false);
      };


      try {
        resultUser = await getSingleDocumentFirebase('users', auth.currentUser.uid);
      } catch (error) {
        console.log(error, "error getting user data");
        throw error;
      };


      try {
        const conditions = [
          {
            field: 'companyId',
            operator: '==',
            value: companies[0]?.id
          },
          {
            field: 'users',
            operator: 'array-contains',
            value: auth.currentUser.uid
          },
        ];

        const sortBy = null;
        const limitValue = null;
        const startAfterData = null;
        resultProjects = await getCollectionFirebase('projects', { conditions }, { sortBy }, { limitValue }, { startAfterData });
      } catch (error) {
        console.log("error getting projects MAIN STACK:", error);
        Alert.alert(error.message);
      };


      const x = {
        ...resultUser,
        ...userData,
        currentCompany: companies[0]?.id,
        current_company_name: companies[0]?.name,
        companies,
        projects: resultProjects,
        currentProject: resultProjects[0].id,
      };
      setUserData(x);
    } else {
      // console.log(userDataFromStorage, "userDataFromStorage");
      setUserData(userDataFromStorage);
    }
  };


  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user && user.uid) {
        setUserCredentials(user);
        // console.log(user.stsTokenManager.accessToken, "getting user from main stack");

        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      };
    });

    getUserData();
  }, []);



  return (
    <Drawer.Navigator
      style={{ flex: 1 }}
      drawerContent={(props) => (
        <CustomDrawerContent {...props} profile={profile} />
      )}
      drawerStyle={
        isLoggedIn && {
          backgroundColor: "white",
          width: width * 0.8,
        }
      }
      screenOptions={{
        activeTintColor: "white",
        inactiveTintColor: "#000",
        activeBackgroundColor: materialTheme.COLORS.ACTIVE,
        inactiveBackgroundColor: "transparent",
        itemStyle: {
          width: width * 0.74,
          paddingHorizontal: 12,
          paddingVertical: 4,
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
          overflow: "hidden",
        },
        labelStyle: {
          fontSize: 18,
          fontWeight: "normal",
        },
      }}
      initialRouteName="Home"
    >
      <Drawer.Screen
        name="Home"
        component={HomeStack}
        options={{
          headerShown: false,
          drawerIcon: ({ focused }) => (
            <Icon
              size={16}
              name="shop"
              family="GalioExtra"
              color={focused ? "white" : materialTheme.COLORS.MUTED}
            />
          ),
        }}
      />
      {/* <Drawer.Screen
        name="Courses"
        component={CoursesStack}
        options={{
          headerShown: false,
          drawerIcon: ({ focused }) => (
            <Icon
              size={16}
              name="shop"
              family="GalioExtra"
              color={focused ? "white" : materialTheme.COLORS.MUTED}
            />
          ),
        }}
      /> */}
      <Drawer.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          headerShown: false,
          drawerIcon: ({ focused }) => (
            <Icon
              size={16}
              name="setting"
              family="GalioExtra"
              color={focused ? "white" : materialTheme.COLORS.MUTED}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

export default MainStack