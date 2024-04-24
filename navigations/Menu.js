import React, { useEffect } from "react";
import {
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  ListView,
  ImageBackground,
} from "react-native";
import { Block, Text, theme } from "galio-framework";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, Drawer as DrawerCustomItem } from "../components/";
import { Images, materialTheme } from "../constants/";
import { signOut } from "firebase/auth";
import { auth } from "../configs/firebase";
import useAuthStore from "../store/user";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get("screen");

const profile = {
  avatar: Images.Profile,
  name: "Rachel Brown",
  type: "Seller",
  plan: "Pro",
  rating: 4.8,
};

function CustomDrawerContent({
  drawerPosition,
  navigation,
  profile,
  focused,
  state,
  ...rest
}) {
  // console.log("🚀 ~ file: Menu.js:37 ~ profile:", profile);
  const { userData } = useAuthStore();

  const insets = useSafeAreaInsets();
  const screens = [
    "Home",
    // "Courses",
    // "Man",
    // "Kids",
    // "New Collection",
    // "Profile",
    // "Settings",
    // "Components",
  ];

  const logout = async () => {
    signOut(auth);
    await AsyncStorage.clear();
    navigation.closeDrawer();
  };

  useEffect(() => {
    return () => { };
  }, [profile]);

  return (
    <Block
      style={styles.container}
      forceInset={{ top: "always", horizontal: "never" }}
    >
      <ImageBackground
        flex={0.23}
        source={require("../assets/images/imagesvg.png")}
        style={styles.header}
        imageStyle={{
          opacity: 0.7,
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => navigation.navigate("Profile")}
        >
          <Block column style={styles.profile}>
            <Image source={{ uri: userData.avatar ? userData?.avatar : userData?.image ? userData?.image : profile?.avatar }} style={styles?.avatar} />
            <Text h5 color={"white"} size={20}>
              {userData ? userData?.name : profile.name}
            </Text>
            <Text
              h6
              color={"white"}
              size={14}
              style={{
                fontWeight: "300",
              }}
            >
              {userData?.email ? userData?.email : auth.currentUser.email}
            </Text>
          </Block>
        </TouchableWithoutFeedback>
        {/* <Block row>
          <Block middle style={styles.pro}>
            <Text size={16} color="white">
              {profile.plan}
            </Text>
          </Block>
          <Text size={16} muted style={styles.seller}>
            {profile.type}
          </Text>
          <Text size={16} color={materialTheme.COLORS.WARNING}>
            {profile.rating}{" "}
            <Icon name="shape-star" family="GalioExtra" size={14} />
          </Text>
        </Block> */}
      </ImageBackground>

      <Block flex style={{ paddingLeft: 7, paddingRight: 14 }}>
        <ScrollView
          contentContainerStyle={[
            {
              paddingTop: insets.top * 0.4,
              paddingLeft: drawerPosition === "left" ? insets.left : 0,
              paddingRight: drawerPosition === "right" ? insets.right : 0,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {screens.map((item, index) => {
            return (
              <DrawerCustomItem
                title={item}
                key={index}
                navigation={navigation}
                focused={state.index === index ? true : false}
                onPress={() => navigation.navigate(item)}
              />
            );
          })}
        </ScrollView>
      </Block>

      <Block flex={0.25} style={{ paddingLeft: 7, paddingRight: 14 }}>
        <DrawerCustomItem
          title="Settings"
          // navigation={navigation}
          focused={state.index === 8 ? true : false}
          onPress={() => navigation.navigate("Settings")}
        />
        <DrawerCustomItem
          title="Sign out"
          // navigation={navigation}
          focused={state.index === 8 ? true : false}
          onPress={() => logout()}
        />
        {/* <DrawerCustomItem
          title="Sign Up"
          navigation={navigation}
          focused={state.index === 9 ? true : false}
        /> */}
      </Block>
    </Block>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#3d3d3d",
    paddingHorizontal: 28,
    paddingBottom: theme.SIZES.BASE,
    paddingTop: theme.SIZES.BASE * 2,
    justifyContent: "center",
  },
  footer: {
    paddingHorizontal: 28,
    justifyContent: "flex-end",
  },
  profile: {
    marginTop: 10,
    marginBottom: theme.SIZES.BASE / 2,
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 30,
    marginBottom: 10,
  },
  pro: {
    backgroundColor: materialTheme.COLORS.LABEL,
    paddingHorizontal: 6,
    marginRight: 8,
    borderRadius: 4,
    height: 19,
    width: 38,
  },
  seller: {
    marginRight: 16,
  },
});

export default CustomDrawerContent;
