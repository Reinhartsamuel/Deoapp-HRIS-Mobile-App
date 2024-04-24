import React, { Fragment, useEffect, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  Platform,
  ImageBackground,
} from "react-native";
import { Block, Text, Button, theme } from "galio-framework";

import moment from "moment";
import axios from "axios";

import materialTheme from "../../../../constants/Theme";
import Images from "../../../../constants/Images";
import { iPhoneNotch } from "../../../../constants/utils";
import { auth } from "../../../../configs/firebase";
import Theme from "../../../../constants/Theme";

const { height, width } = Dimensions.get("window");

function LiveAttendance({ navigation }) {
  return (
    <Fragment>
      <Block flex style={styles.main}></Block>
    </Fragment>
  );
}

export default LiveAttendance;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#3d3d3d",
  },
  home: {
    width: width,
    backgroundColor: "#ffffff",
  },
  profileImage: {
    width: width * 1.1,
    height: "auto",
  },
  section1: {
    alignItems: "center",
    position: "relative",
    // height:
    //   Platform.OS === "android"
    //     ? height * 0.45
    //     : Platform.OS === "ios" && !iPhoneNotch
    //     ? height * 0.54
    //     : height * 0.5,
    paddingTop: 35,
  },
  Block1: {
    marginHorizontal: 20,
    marginTop:
      Platform.OS === "android"
        ? height * 0.02
        : Platform.OS === "ios" && !iPhoneNotch
        ? height * 0.03
        : height * 0.06,
    marginBottom: Platform.OS === "ios" && !iPhoneNotch ? 5 : 0,
    justifyContent: "flex-start",
    width: width * 0.9,
  },
  Block2: {
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: Platform.OS === "ios" && !iPhoneNotch ? 0 : 0,
    width: width * 0.9,
  },
  Block3: {
    height: height * 0.06,
    marginBottom: height * 0.025,
    paddingEnd: -20,
    // backgroundColor: "white",
  },
  iconBlock: {
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    width: width * 0.12,
    // backgroundColor: "#ffd600",
  },
  avatarBlock: {
    paddingTop:
      Platform.OS === "android"
        ? height * 0.02
        : Platform.OS === "ios" && !iPhoneNotch
        ? height * 0.025
        : height * 0.02,
  },
  section2: {
    // paddingnHorizontal: (width * 0.1) / 2,
    // paddingTop: 15,
  },
  search: {
    height: 48,
    width: width - 32,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 3,
  },
  header: {
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    elevation: 4,
    zIndex: 2,
  },
  tabs: {
    marginBottom: 24,
    marginTop: 10,
    elevation: 4,
  },
  tab: {
    backgroundColor: theme.COLORS.TRANSPARENT,
    width: width * 0.5,
    borderRadius: 0,
    borderWidth: 0,
    height: 24,
    elevation: 0,
  },
  tabTitle: {
    lineHeight: 19,
    fontWeight: "300",
  },
  divider: {
    borderRightWidth: 0.3,
    borderRightColor: theme.COLORS.MUTED,
  },
  container: {
    width: width - theme.SIZES.BASE * 0,
  },
  avatar: {
    height:
      Platform.OS === "android"
        ? 60
        : Platform.OS === "ios" && !iPhoneNotch
        ? 50
        : 60,
    width:
      Platform.OS === "android"
        ? 60
        : Platform.OS === "ios" && !iPhoneNotch
        ? 50
        : 60,
    borderRadius: 50,
    marginBottom: theme.SIZES.BASE,
  },
  glassBox: {
    backgroundColor: "rgba(255, 255, 255, 0.21)",
    borderRadius: 16,
    shadowColor: "rgba(255, 255, 255, 0.05)",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 30,
    shadowOpacity: 1,
    elevation: 5, // For Android shadow
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  glassBox2: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "rgba(255, 255, 255, 0.05)",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 30,
    shadowOpacity: 1,
    elevation: 5, // For Android shadow
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
});
