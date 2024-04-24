import React, {
  Fragment,
  useEffect,
  useState,
  useRef,
} from "react";
import { Image } from 'expo-image';
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  // Image,
  Platform,
  ImageBackground,
  View,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Block, Text, Button, theme, Input } from "galio-framework";

import { iPhoneNotch } from "../../../../constants/utils";
import { auth } from "../../../../configs/firebase";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";

// import DatePicker from "@dietime/react-native-date-picker";
import moment from "moment";
import axios from "axios";
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from "../../../../store/user";


const { height, width } = Dimensions.get("window");

import LeaveCardApproval from "../../../../components/LeaveCardApproval";

function TimeOffLog({ navigation, route }) {
  const tabId = route.params?.tabId;
  const [selectedMenu, setSelectedMenu] = useState([]);
  const [dataLeave, setDataLeave] = useState([]);
  const [leaveCategories, setLeaveCategories] = useState([]);
  const [listLaveApproval, setListLaveApproval] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [note, setNote] = useState("");
  const [selectedImage, setSelectedImage] = useState("");


  const noteRef = useRef();

  const { userData } = useAuthStore();

  const getTimeoffs = async () => {
    setIsLoading(true)
    const config = {
      method: 'get',
      url: `https://asia-southeast2-deoapp-indonesia.cloudfunctions.net/hris/api/leave-request/${auth.currentUser.uid}`,
      headers: {
        'Authorization': `Bearer ${auth.currentUser.stsTokenManager.accessToken}`,
        'project': userData.currentProject
      }
    };

    console.log(config, "config get timeoff history")
    try {
      const result = await axios(config);


      // const sortedData = result?.data?.data?.
      //   filter((x) => x?.user_uid === auth.currentUser.uid)?.
      //   sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt));

      // console.log("result get leave request", sortedData);
      console.log("result", result.data.data?.sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt)))
      setDataLeave(result.data.data?.sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt)));
      // setSelectedMenu(sortedData?.filter((x) => x?.status === "waiting"));
    } catch (error) {
      console.log("error when getting leave request", error);
      throw new error;
    } finally {
      setIsLoading(false);
    };


    // try {
    //   const config = {
    //     method: 'get',
    //     url: 'https://asia-southeast2-lifetime-design-erp.cloudfunctions.net/production/hris/leave-approval-list',
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Authorization": `Bearer ${auth?.currentUser?.stsTokenManager?.accessToken}`,
    //     },
    //   };

    //   const result = await axios(config);
    //   // console.log("result approval manager ::::::::::", result?.data?.data?.filter(x => x?.LeaveRequest?.status === 'waiting'))
    //   setListLaveApproval(result?.data?.data?.filter(x => x?.LeaveRequest?.status === 'waiting'));
    // } catch (error) {
    //   console.log("error when getting leave approval", error);
    //   throw new error;
    // } finally {
    //   setIsLoading(false);
    // };
  };


  const getLeaveType = async () => {
    const config = {
      method: 'get',
      url: 'https://asia-southeast2-deoapp-indonesia.cloudfunctions.net/hris/api/leave-request-category',
      headers: {
        'Authorization': `Bearer ${auth.currentUser.stsTokenManager.accessToken}`
      }
    };
    try {
      const result = await axios(config);
      setLeaveCategories(result?.data?.data);
      console.log(result?.data?.data, "::::::: leave categories");
    } catch (error) {
      console.log(error.message, ":::error getting leave types")
      throw new error;
    } finally {
      // setIsLoading(false);
    };
  };

  const handleModal = (obj, args) => {
    setSelectedItem(obj);
    setModalVisible(true);
  };

  const handleApprove = async (args) => {
    const config = {
      method: 'put',
      url: 'https://asia-southeast2-lifetime-design-erp.cloudfunctions.net/production/hris/leave-approval-manager-approve',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${auth?.currentUser?.stsTokenManager?.accessToken}`,
        "company": userData?.company?.id
      },
      data: {
        status: args,
        leave_request_id: selectedItem?.LeaveRequest?.id,
        note: note
      }
    };
    try {
      const result = await axios(config);
      if (result?.data?.status) {
        console.log("result of approving or rejecting::::", result?.data);
        getTimeoffs();
        setModalVisible(false);
      };
    } catch (error) {
      console.log("error approving/rejecting:: ", error);
    };
  };

  // useEffect(() => {
  //   handleChangeMenu();
  // }, [tabId]);

  useEffect(() => {
    getTimeoffs();
    getLeaveType();
  }, []);

  return (
    <Fragment>

      <ImageBackground
        source={require("../../../../assets/images/imagesvg.png")}
        style={styles.logCorrection}
      >
        {/* <Block flex style={styles.section1}></Block> */}
        {
          isLoading ? <Block center middle height={height}>
            <ActivityIndicator size="large" />
          </Block> :
            <Block flex style={[styles.section2, styles.glass]}>
              <Block
                flex
                style={{
                  marginVertical: height * 0.03,
                  alignItems: "center",
                }}
              >



                <FlatList
                  data={dataLeave}
                  vertical={true}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  keyExtractor={(item, index) => `${index}-${item.title}`}
                  renderItem={({ item, index }) => (
                    <LeaveCardApproval
                      item={item}
                      handleModal={handleModal}
                      setSelectedImage={setSelectedImage}
                      leaveCategories={leaveCategories}
                    />
                  )}
                  ListEmptyComponent={<>
                    <Image
                      style={{
                        width: 250,
                        height: 250,
                      }}
                      source={require("../../../../assets/images/select-date.png")}
                      alignSelf='center'
                    />
                    <Text color='gray' alignSelf='center' bold size={18}>
                      No Leave Request
                    </Text>
                    <Text color='gray' marginTop={10} justify='center' alignSelf='center' size={14}>
                      Go to home, click "Request Leave" to make new request
                    </Text>
                  </>}
                />



              </Block>
            </Block>}
        {/* <View style={styles.centeredView}> */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <ScrollView>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                {/* <Text style={styles.modalText}>image:{selectedImage}</Text> */}

                {selectedImage &&
                  <>
                    <Image
                      source={{ uri: selectedImage }}
                      style={{ width: "80%", height: undefined, aspectRatio: 9 / 16 }}
                    />
                  </>
                }

                {tabId === "approval" &&
                  <>
                    <Text>Note:</Text>
                    <Input
                      placeholder="Notes here"
                      onChangeText={e => setNote(e)}
                      color="black"
                    />
                    <Block flex row>
                      <Button color="green" onPress={() => handleApprove("approve")}>Approve</Button>
                      <Button color="red" onPress={() => handleApprove("reject")}>Reject</Button>
                    </Block>
                  </>}

                <Button color={theme.COLORS.MUTED} onPress={() => setModalVisible(false)}>Close</Button>

              </View>
            </View>
          </ScrollView>
        </Modal>
        {/* </View> */}



      </ImageBackground >
      {/* <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Block marginTop={2}>
              <Text>Confirm to {actionType} this request?</Text>

              <Text>Note:</Text>
              <Input onChangeText={e => console.log(e)} />
            </Block>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose, { marginTop: 10 }]}
              onPress={handleApprove}>
              <Text style={styles.textStyle}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}
    </Fragment >
  );
}

export default TimeOffLog;

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
    paddingTop: theme.SIZES.BASE * 1.5,
  },
  category: {
    backgroundColor: theme.COLORS.WHITE,
    marginVertical: theme.SIZES.BASE / 2,
    borderWidth: 0,
    width: width * 0.8,
    // height: height * 0.25,
    justifyContent: "space-betweena",
  },
  categoryTitle: {
    // height: "100%",
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: theme.SIZES.BASE,
    // backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    // alignItems: "center",
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
  },
  section1: {
    marginTop:
      Platform.OS === "android"
        ? height * 0.001
        : Platform.OS === "ios" && !iPhoneNotch
          ? height * 0.07
          : height * 0.06,
    position: "relative",
    alignItems: "center",
    // backgroundColor: "##521E9F",
    marginHorizontal: width * 0.01,
    // marginVertical: height * 0.1,
    maxHeight: height * 0.08,
    borderRadius: 50,
  },
  section2: {
    position: "relative",
    marginHorizontal: theme.SIZES.BASE,
    marginTop: theme.SIZES.BASE * 5,
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
    paddingTop: 22,
    backgroundColor:'black',
    height
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
