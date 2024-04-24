import React, {
  Fragment,
  useCallback,
  useEffect,
  useState,
  Component,
  useRef,
} from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  Platform,
  ImageBackground,
  View,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Block, Text, Button, theme } from "galio-framework";

import materialTheme from "../../../../constants/Theme";
import Images from "../../../../constants/Images";
import { iPhoneNotch } from "../../../../constants/utils";
import { auth } from "../../../../configs/firebase";
import Theme from "../../../../constants/Theme";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";

// import DatePicker from "@dietime/react-native-date-picker";
import moment from "moment";
import axios from "axios";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SelectDropdown from "react-native-select-dropdown";

const { height, width } = Dimensions.get("window");

const years = [2021, 2022, 2023];

function PayslipLog({ navigation, route }) {

  const currentYear = moment().format("YYYY");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [payslips, setPayslips] = useState([]);

  const handleCloseModal = () => {
    setShowDatePicker(false);
  };

  const getPayslip = async () => {
    const uid = auth.currentUser.uid;
    const config = {
      method: 'get',
      url: `https://asia-southeast2-lifetime-design-erp.cloudfunctions.net/production/hris/payroll/by-user?user_id=${uid}`,
      headers: {
        'Authorization': `Bearer ${auth.currentUser.stsTokenManager.accessToken}`,
        'user_id': uid
      }
    };


    try {
      const result = await axios(config);
      setPayslips(result?.data?.income_list);
      console.log("result getting payslitp : ", result.data?.income_list);
    } catch (error) {
      console.log("error getting payslip", error.message);
    };
  };



  useEffect(() => {
    getPayslip();
  }, []);

  // ** Console Log

  return (
    <Fragment>
      <ImageBackground
        source={require("../../../../assets/images/imagesvg.png")}
        style={styles.logCorrection}
      >
        <Block flex style={styles.section1}>
          {/* <DatePicker
            value={date}
            format="yyyy"
            height={80}
            width={240}
            markWidth={90}
            textColor="white"
            markColor="#2D7482"
            fadeColor="#611595"
            fontSize={16}
            startYear={availableYear}
            onChange={(value) => setDate(value)}
          /> */}
          <TouchableOpacity
            style={[
              {
                marginTop: 12,
              },
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Block
              row
              center
              style={{
                justifyContent: "space-evenly",
                alignItems: "center",
                alignContent: "center",
                width: "90%",
              }}
            >
              <Block
                center
                style={[
                  {
                    height: 120,
                    width: "28%",
                    justifyContent: "center",
                  },
                  styles.glassTime,
                ]}
              >
                <Text color="white" size={32} bold>
                  {currentYear}
                </Text>

              </Block>
            </Block>
          </TouchableOpacity>
        </Block>


        <Block flex style={styles.section2}>
          <Block
            flex
            style={{
              marginVertical: height * 0.03,
            }}
          >
            <FlatList
              data={payslips}
              horizontal={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item, index) => `${index}-${item.title}`}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => navigation.navigate("PayslipDetail", {
                    item
                  })}
                >
                  <Block row card style={[styles.lists, 
                    // styles.shadow
                    ]}>
                    <MaterialCommunityIcons
                      name="file-document-outline"
                      size={24}
                      color="black"
                      style={{
                        marginRight: 10,
                      }}
                    />
                    <Text>{moment(item.createdAt).format("MMM YYYY")}</Text>
                  </Block>
                </TouchableOpacity>

              )}


            />
          </Block>
        </Block>
      </ImageBackground>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDatePicker}
        onRequestClose={() => {
          setShowDatePicker(!showDatePicker);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Block>
              <SelectDropdown
                style={{ marginTop: 5 }}
                data={years}
                onSelect={(selectedItem, index) => {
                  console.log(selectedItem, index)
                  setSelectedYear(selectedItem)
                }}
                buttonTextAfterSelection={(selectedItem, index) => {
                  // text represented after item is selected
                  // if data array is an array of objects then return selectedItem.property to render after item is selected
                  return selectedItem
                }}
                rowTextForSelection={(item, index) => {
                  // text represented for each item in dropdown
                  // if data array is an array of objects then return item.property to represent item in dropdown
                  return item
                }}
                defaultButtonText={"Select Year"}
              />
            </Block>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose, { marginTop: 10 }]}
              onPress={handleCloseModal}>
              <Text style={styles.textStyle}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Fragment>
  );
}

export default PayslipLog;

const styles = StyleSheet.create({
  item: {
    backgroundColor: "white",
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  categories: {
    width: width,
  },
  categoryList: {
    justifyContent: "center",
    // paddingTop: theme.SIZES.BASE * 1.5,
  },
  lists: {
    backgroundColor: theme.COLORS.WHITE,
    marginVertical: theme.SIZES.BASE / 1.5,
    borderWidth: 0,
    height: height * 0.08,
    padding: 10,
    alignItems: "center",
  },
  categoryTitle: {
    height: "100%",
    paddingHorizontal: theme.SIZES.BASE,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageBlock: {
    overflow: "hidden",
    borderRadius: 4,
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  avatar: {
    height:
      Platform.OS === "android"
        ? 60
        : Platform.OS === "ios" && !iPhoneNotch
          ? 60
          : 60,
    width:
      Platform.OS === "android"
        ? 60
        : Platform.OS === "ios" && !iPhoneNotch
          ? 60
          : 60,
    borderRadius: 100,
  },
  logCorrection: {
    flex: 1,
    // backgroundColor: "#ffffff",
  },
  section1: {
    marginTop:
      Platform.OS === "android"
        ? height * 0.07
        : Platform.OS === "ios" && !iPhoneNotch
          ? height * 0.07
          : height * 0.06,
    position: "relative",
    alignItems: "center",
    // backgroundColor: "##521E9F",
    marginHorizontal: width * 0.01,
    // marginVertical: height * 0.1,
    maxHeight: height * 0.15,
    borderRadius: 50,
  },
  section2: {
    position: "relative",
    marginHorizontal: theme.SIZES.BASE,
    marginTop: -theme.SIZES.BASE * 1,
    marginBottom: 0,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    paddingHorizontal: width * 0.05,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
