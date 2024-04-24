import { useEffect, useRef, useState } from "react";
import { Camera, CameraType } from "expo-camera";
import { Block, Button } from "galio-framework";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
  Alert,
  Modal,
} from "react-native";
import {
  MaterialCommunityIcons,
  MaterialIcons,
  Ionicons,
  Entypo,
} from "@expo/vector-icons";
// import * as FaceDetector from "expo-face-detector";
import { manipulateAsync, FlipType, SaveFormat } from "expo-image-manipulator";
import { auth } from "../../../../configs/firebase";
import moment from "moment";
import { Upload, UploadWithBytes } from "../../../../services/imageUpload";
import { decode } from "base-64";
import axios from "axios";
import * as Location from "expo-location";
import Theme from "../../../../constants/Theme";
// import MapView, { Marker } from 'react-native-maps';
import useLocationStore from "../../../../store/location";

const { height, width } = Dimensions.get("window");
const screenRatio = height / width;

function AttendanceCamera({ navigation }) {
  // ** Status State
  // const [isUserExist, setIsUserExist] = useState(true);
  const [capturedImg, setCapturedImg] = useState({});
  // ** Camera State
  const [type, setType] = useState(CameraType.front);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [availableRatio, setAvailableRatio] = useState([]);
  const [selectedRatio, setSelectedRatio] = useState(null);
  const cameraRef = useRef(null);
  const [imagePadding, setImagePadding] = useState(0);
  const [location, setLocation] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [isRatioSet, setIsRatioSet] = useState(false);
  const [status, requestLocationPermission] = Location.useForegroundPermissions();
  const [modalVisible, setModalVisible] = useState(true);
  const [isButtonHover, setIsButtonHover] = useState(false);
  const [lat, setLat] = useState(0);
  const [long, setLong] = useState(0);

  const { latitude, longitude } = useLocationStore(state => state);


  const platform = Platform.OS;

  const toggleCameraType = () => {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  // const handleFacesDetected = (e) => {
  //   if (e.faces.length > 0) {
  //     setIsUserExist(true);
  //   } else {
  //     setIsUserExist(true);
  //   }
  // };

  const onCameraCapture = async () => {
    try {
      setIsLoading(true);

      if (cameraRef.current) {
        let photo = await cameraRef.current.takePictureAsync();

        if (type === CameraType.front) {
          photo = await manipulateAsync(
            photo.localUri || photo.uri,
            [
              { rotate: 180 },
              { flip: FlipType.Vertical },
              {
                resize: {
                  height: 1920,
                },
              },
            ],
            { compress: 1, format: SaveFormat.PNG, base64: false }
          );
        }

        setCapturedImg({ ...photo });
        setIsCaptured(true);

        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const onRemoveCapturedImg = () => {
    setIsCaptured(false);
    setCapturedImg({});
  };

  const submitAttendance = async () => {

    setIsLoading(true);

    const type = `attendances/${auth.currentUser.uid
      }/live-attendance/${moment().format("MMMM-YYYY")}`;

    const title = `${auth.currentUser.uid} - ${moment().format()}`;

    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", capturedImg.uri, true);
      xhr.send(null);
    });

    try {
      const uploadAttendanceImage = await UploadWithBytes(title, type, blob);
      const { url } = uploadAttendanceImage;

      console.log({
        image: url,
        // latitude: location.coords.latitude || lat,
        // longitude: location.coords.longitude || long,
        latitude: latitude,
        longitude: longitude
      })
      const submitData = await axios.post(
        `https://asia-southeast2-lifetime-design-erp.cloudfunctions.net/production/hris/attendance`,
        {
          image: url,
          // latitude: location.coords.latitude || lat,
          // longitude: location.coords.longitude || long,
          latitude: latitude,
          longitude: longitude
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: auth.currentUser.stsTokenManager.accessToken,
          },
        }
      );

      if (submitData !== undefined) {
        console.log("submitData", submitData?.data?.data);
        Alert.alert("Attendance recorded on " + moment().format("DD-MM-YYYY HH:mm:ss") + "👍" + submitData?.data?.data?.id && `ID : ${submitData?.data?.data?.id}`);
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert("Oops, there's an error. Please try again later / request correction" + `(${error.messages})`);
      navigation.goBack();
      throw error;
    } finally {
      setIsLoading(false);
    };
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync() || await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      requestPermission();
      requestLocationPermission();
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      let resf = await Location.getForegroundPermissionsAsync();
      let resb = await Location.getBackgroundPermissionsAsync();

      if (resf.status != "granted" && resb.status !== "granted") {
        console.log("Permission to access location was denied");
      } else {
        // console.log("Permission to access location granted");
      }

      let locationx = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 5000, // 5 seconds interval
      });

      setLat(locationx.coords.latitude);
      setLong(locationx.coords.longitude);
    })();

    return () => { };
  }, [isLoading, isRatioSet, cameraRef.current, selectedRatio]);

  const prepareRatio = async () => {
    let desiredRatio = "4:3";
    if (platform === "android") {
      const ratios = await cameraRef.current.getSupportedRatiosAsync();
      let distances = {};
      let realRatios = {};
      let minDistance = null;
      for (const ratio of ratios) {
        const parts = ratio.split(":");
        const realRatio = parseInt(parts[0]) / parseInt(parts[1]);
        realRatios[ratio] = realRatio;
        const distance = screenRatio - realRatio;
        distances[ratio] = realRatio;
        if (minDistance == null) {
          minDistance = ratio;
        } else {
          if (distance >= 0 && distance < distances[minDistance]) {
            minDistance = ratio;
          }
        }
      }
      desiredRatio = minDistance;
      const remainder = Math.floor(
        (height - realRatios[desiredRatio] * width) / 2
      );

      // console.log("====================================");
      // console.log(desiredRatio, "desiredRatio");
      // console.log("====================================");
      setImagePadding(remainder);
      setSelectedRatio(desiredRatio);
      setIsRatioSet(true);
    }
  };

  const onCameraReady = async () => {
    if (!isRatioSet) {
      await prepareRatio();
    }
  };

  if (!permission || !status) {
    return (
      <View style={styles.container}>
        <Text>Waiting for permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <Block
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          alignContent: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <View style={styles.permissionContainer}>
          <Text>No access to camera</Text>
          <Button onPress={() => requestPermission()}>
            Open Camera
          </Button>
        </View>
      </Block>
    );
  }

  // if (modalVisible) {
  //   return <View style={styles.centeredView}>
  //     <Modal
  //       animationType="slide"
  //       transparent={true}
  //       visible={modalVisible}
  //       onRequestClose={() => {
  //         Alert.alert('Modal has been closed.');
  //         setModalVisible(!modalVisible);
  //       }}>
  //       <MapView
  //         style={styles.map}
  //         initialRegion={{
  //           latitude: 106.71130331039245,
  //           longitude: -122.0849872,
  //           latitudeDelta: 0.0922,
  //           longitudeDelta: 0.0421,
  //         }}

  //       >

  //         <Marker
  //           coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
  //           image={{ uri: 'https://png.pngtree.com/png-clipart/20191120/original/pngtree-map-location-marker-icon-in-red-png-image_5004115.jpg' }}
  //         />
  //       </MapView>
  //       {/* <View style={styles.centeredView}>
  //         <View style={styles.modalView}>
  //           <Text style={styles.modalText}>Hello World!</Text>
  //           <TouchableOpacity
  //             style={[styles.button, styles.buttonClose]}
  //             onPress={() => setModalVisible(!modalVisible)}>
  //             <Text style={styles.textStyle}>Hideeee Modal</Text>
  //           </TouchableOpacity>
  //         </View>
  //       </View> */}
  //     </Modal>
  //   </View>
  // }

  return (
    <View style={styles.container}>
      {isCaptured ? (
        <View
          style={{
            flex: 1,
            position: "relative",
            justifyContent: "center",
            backgroundColor: "#2d2d2d",
          }}
        >
          {!isLoading && (
            <Image
              source={{ uri: capturedImg.uri }}
              style={[
                styles.camera,
                { marginBottom: imagePadding, marginTop: imagePadding },
              ]}
            />
          )}

          <View style={[styles.buttonContainer]}>
            <TouchableOpacity
              onPress={() => navigation.navigate("LiveAttendance")}
              style={{
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 70,
                width: width * 0.12,
                height: width * 0.12,
                borderWidth: 3,
                borderColor: isLoading === true ? "grey" : "white",
              }}
              disabled={isLoading === true ? true : false}
            >
              <Entypo
                name="back"
                size={width * 0.05}
                color={isLoading === true ? "grey" : "white"}
              />
            </TouchableOpacity>

            <Button
              onPress={() => submitAttendance()}
              style={{
                backgroundColor:
                  isLoading === true
                    ? "grey"
                    : isButtonHover
                      ? "#9C39B0"
                      : Theme.COLORS.BUTTON_COLOR,
                shadowColor: isButtonHover ? "#1a1a1a" : "#1a1a1a",
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                alignContent: "center",
                borderRadius: 70,
                maxWidth: width * 0.3,
              }}
              onPressIn={() => setIsButtonHover(true)}
              onPressOut={() => setIsButtonHover(false)}
              disabled={isLoading === true ? true : false}
            >
              {isLoading && <ActivityIndicator size="small" color="#1d1d1d" />}

              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "bold",
                  justifyContent: "center",
                }}
                allowFontScaling={false}
              >
                {!isLoading && "SUBMIT"}
              </Text>
            </Button>

            <TouchableOpacity
              onPress={() => onRemoveCapturedImg()}
              style={{
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 70,
                width: width * 0.12,
                height: width * 0.12,
                borderWidth: 3,
                borderColor: isLoading === true ? "grey" : "red",
              }}
              disabled={isLoading === true ? true : false}
            >
              <MaterialCommunityIcons
                name="delete"
                size={width * 0.06}
                color={isLoading === true ? "grey" : "red"}
              />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            position: "relative",
            justifyContent: "center",
            backgroundColor: "#2d2d2d",
          }}
        >
          <Camera
            onCameraReady={() => onCameraReady()}
            // onFacesDetected={(e) => handleFacesDetected(e)}
            ref={cameraRef}
            style={[
              styles.camera,
              { marginBottom: imagePadding, marginTop: imagePadding },
            ]}
            ratio={selectedRatio}
            type={type}
          // faceDetectorSettings={{
          //   mode: FaceDetector.FaceDetectorMode.fast,
          //   detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
          //   runClassifications: FaceDetector.FaceDetectorClassifications.none,
          //   minDetectionInterval: 100,
          //   tracking: true,
          // }}
          />

          <View style={[styles.buttonContainer]}>
            <TouchableOpacity
              onPress={() => navigation.navigate("LiveAttendance")}
              style={{
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 70,
                width: width * 0.12,
                height: width * 0.12,
                borderWidth: 3,
                borderColor: isLoading ? "grey" : "white",
              }}
            >
              <Entypo
                name="back"
                size={width * 0.05}
                color={isLoading ? "grey" : "white"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              disabled={isLoading ? true : false}
              onPress={() => onCameraCapture()}
              style={{
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 70,
                width: width * 0.16,
                height: width * 0.16,
                borderWidth: 3,
                borderColor:
                  isLoading ? "grey" : "white",
              }}
            >
              <MaterialCommunityIcons
                name={
                  isLoading === true
                    ? "camera-off"
                    : "camera"
                }
                // name={isLoading ? "camera-off" : "camera"}
                size={width * 0.08}
                color={
                  isLoading === true
                    ? "grey"
                    : "white"
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => toggleCameraType()}
              style={{
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 70,
                width: width * 0.12,
                height: width * 0.12,
                borderWidth: 3,
                borderColor: isLoading ? "grey" : "white",
              }}
            >
              <MaterialCommunityIcons
                name={
                  type === CameraType.front ? "camera-rear" : "camera-front"
                }
                size={width * 0.05}
                color={isLoading ? "grey" : "white"}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  permissionContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    position: "relative",
    width: "100%",
  },
  camera: {
    flex: 1,
    justifyContent: "flex-end",
    width: width,
    height: height,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  ButtonStyle: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 70,
    width: width * 0.14,
    height: width * 0.14,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: height,
    marginTop: 22,
    // backgroundColor :"red"
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
  map: {
    alignSelf: 'center',
    marginTop: height * 0.1,
    width: '100%',
    height: '70%',
  },
});

export default AttendanceCamera;
