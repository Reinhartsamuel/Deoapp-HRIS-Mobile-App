import {
    ScrollView,
    StyleSheet,
    View,
    DevSettings,
    RefreshControl,
    Modal,
    ActivityIndicator,
    Alert,
    Platform,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Camera } from "expo-camera";
import * as Location from "expo-location";
import {
    addDoc,
    collection,
    serverTimestamp,
} from "firebase/firestore";
import * as ImageManipulator from "expo-image-manipulator";
import axios from "axios";
import { UploadWithBytes } from "../../../../services/imageUpload";
import { Block, Button, Text, Icon, theme, } from "galio-framework";
import useAuthStore from "../../../../store/user";
import { currentTime, extra } from "../../../../services/utils";
import moment from "moment";
import { auth, db } from "../../../../configs/firebase";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { iPhoneNotch } from "../../../../constants/utils";
import { Image } from "expo-image";
import Theme from "../../../../constants/Theme";
import { useNavigation } from "@react-navigation/native";


const { width } = Dimensions.get('window');
const AppButton = ({
    title,
    icon,
    color,
    fontColor,
    onPress,
}) => {
    return (
        <Button backgroundColor={color} onPress={onPress}>
            {icon == 'briefcase-clock' ?
                <MaterialCommunityIcons name="briefcase-clock" size={24} color="black" />
                :
                <Icon name={icon} family="Galio" color={'rgb(100, 120, 40)'} size={10} />
            }
            <Text color={fontColor}>{title}</Text>
        </Button>
    )
}

const AttendanceClone = () => {
    const { userData } = useAuthStore();
    const navigation = useNavigation();
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [showModal, setShowModal] = useState(false);

    const [myAttendance, setMyAttendance] = useState({});
    const [inOut, setInOut] = useState([]);

    const timeIn = moment("9:00", "h:mm").format("h:mm a");
    const timeOut = moment("18:00", "h:mm").format("h:mm a");

    //location
    const [location, setLocation] = useState(null);
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");

    // checking clock in or clock out
    const startClockIn = moment(extra + "05:00");
    const endClockIn = moment(extra + "11:00");
    const startClockOut = moment(extra + "11:00");
    const endClockOut = moment(extra + "23:59");
    const isClockIn = moment(currentTime).isBetween(startClockIn, endClockIn);
    const isClockOut = moment(currentTime).isBetween(startClockOut, endClockOut);

    const [loading, setLoading] = useState(false);

    const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
    const [hasPermission, setHasPermission] = useState(null);
    const [isPreview, setIsPreview] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);

    const cameraRef = useRef();

    const getLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission to access location was denied");
            return;
        }

        let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 1000
        });
        setLocation(location);
        setLat(location?.coords?.latitude);
        setLng(location?.coords?.longitude);
    };

    const onHandleCloseModal = async () => {
        setShowModal(false);
        setIsPreview(false);
        setCapturedImage(null);
    };

    const onHandlePermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        // console.log(status, "status");
        setHasPermission(status === "granted");
    };

    const onCameraReady = () => {
        console.log("camera is ready!!")
        setIsCameraReady(true);
    };

    const switchCamera = () => {
        if (isPreview) {
            return;
        }
        setCameraType((prevCameraType) =>
            prevCameraType === Camera.Constants.Type.back
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back
        );
    };

    const onSnap = async () => {
        try {
            if (cameraRef.current) {
                // const options = { quality: 0.1, base64: true };
                const data = await cameraRef.current.takePictureAsync({
                    quality: 0.2,
                    base64: true,
                });

                if (data) {
                    // await cameraRef.current.pausePreview();
                    const manipResult = await ImageManipulator.manipulateAsync(
                        data.uri,
                        [{ flip: ImageManipulator.FlipType.Horizontal }],
                        { compress: 0.2, format: ImageManipulator.SaveFormat.PNG }
                    );
                    setCapturedImage(manipResult.uri);
                    setIsPreview(true);
                }
            }
        } catch (error) {
            console.log(error, "error");
        }
    };

    const cancelPreview = async () => {
        setIsPreview(false);
        await cameraRef.current.resumePreview();
    };

    const CameraScreen = () => {
        if (permission === null)
          // Camera permissions are still loading
          return <Text>permission: {JSON.stringify(permission)}</Text>
    
        if (permission === false) {
          return <Text color='red'>No access to camera</Text>;
        }
    
        if (permission) {
          return (
            <>
              <Camera
                ref={cameraRef}
                style={styles.camera}
                type={cameraType}
                onCameraReady={onCameraReady}
              ></Camera>
            </>
          );
        }
      };

    const capture = async () => {
        const currentDate = moment().format("DD-MM-YYYY hh:mm:ss");
        const fileName = `${userData.uid} -${currentDate}`;

        const manipResult = await ImageManipulator.manipulateAsync(
            capturedImage,
            [{ resize: { width: 300 } }],
            { compress: 0.2, format: ImageManipulator.SaveFormat.PNG }
        );

        const response = await fetch(manipResult.uri);
        const blob = await response.blob();

        const attendanceUploadImage = await UploadWithBytes(
            fileName,
            "attendance",
            blob,
            userData.currentCompany
        );
        const data = {
            image: attendanceUploadImage.url,
            date: moment().format("DD-MM-YYYY"),
            uid: userData.uid,
            email: userData.email,
            timestamp: serverTimestamp(),
            latitude: lat,
            longitude: lng,
        };

        const payload = {
            image: attendanceUploadImage.url,
            date: moment().format("DD-MM-YYYY"),
            timestamp: moment().format(),
            latitude: lat,
            longitude: lng,
        };

        if (currentAttendance("in") === 0 && isClockIn) {
            data.in = moment().format("HH:mm:ss");
            data.type = "in";
            payload.time = moment().format("HH:mm:ss");
            payload.status = "in";
        } else if (currentAttendance("out") === 0 && isClockOut) {
            data.out = moment().format("HH:mm:ss");
            data.type = "out";
            payload.time = moment().format("HH:mm:ss");
            payload.status = "out";
        } else if (currentAttendance("in") === 0 && isClockOut) {
            data.out = moment().format("HH:mm:ss");
            data.type = "out";
            payload.time = moment().format("HH:mm:ss");
            payload.status = "out";
        }

        try {
            setLoading(true)
            const docRef = await addDoc(
                collection(db, `company/${userData.currentCompany}/attendance`),
                data
            );


            if (currentAttendance("in") === 0 && isClockIn) {
                const setInAttendanceToMysql = await axios.post(
                    `https://asia-southeast2-qantor-production.cloudfunctions.net/hr/attendance/live-attendance?selectedCompany=${userData.currentCompany}`,
                    {
                        date: data.date,
                        uid: data.uid,
                        longitude: data.longitude,
                        type: data.type,
                        in: data.in,
                        email: data.email,
                        image: data.image,
                        latitude: data.latitude,
                        docId: docRef.id,
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Methods":
                                "GET,PUT,POST,DELETE,PATCH,OPTIONS",
                            "Access-Control-Allow-Headers":
                                "Origin, X-Requested-With, Content-Type, Accept",
                        },
                    }
                );
                console.log(setInAttendanceToMysql, "ini data in");
            } else if (currentAttendance("out") === 0 && isClockOut) {
                const setOutAttendanceToMysql = await axios.post(
                    `https://asia-southeast2-qantor-production.cloudfunctions.net/hr/attendance/live-attendance?selectedCompany=${userData.currentCompany}`,
                    {
                        date: data.date,
                        uid: data.uid,
                        longitude: data.longitude,
                        type: data.type,
                        out: data.out,
                        email: data.email,
                        image: data.image,
                        latitude: data.latitude,
                        docId: docRef.id,
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Methods":
                                "GET,PUT,POST,DELETE,PATCH,OPTIONS",
                            "Access-Control-Allow-Headers":
                                "Origin, X-Requested-With, Content-Type, Accept",
                        },
                    }
                );
                console.log(setOutAttendanceToMysql, "ini data out");
            }

            // if (docRef) console.log(docRef.id);
            await onHandleCloseModal();
        } catch (error) {
            Alert.alert(error.message, "ERROR in posting attendance");
        } finally {

        }
    };

    //current attendance
    const currentAttendance = (key) => {
        const currentDateAttendance = inOut.find(
            (x) => x.date === moment().format("DD-MM-YYYY") && x.key !== undefined
        );
        if (currentDateAttendance) {
            // console.log(
            //   currentDateAttendance.data["in"],
            //   "this is the current date attendance"
            // );
            console.log(
                currentDateAttendance.data[key],
                "this is the current date attendance"
            );
            return currentDateAttendance.data[key];
        } else return 0;
    };


    useEffect(() => {
        requestPermission();
        onHandlePermission();
        getLocation();
    }, []);
    return <CameraScreen />
    return (
        <>
            {/* <AppBar AppTitle="Attendance" IconName="calendar-clock" /> */}
            <ScrollView
                paddingBottom="100"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={() => DevSettings.reload()}
                    />
                }
            >
                <Block backgroundColor="white" padding={4} width="full">
                    <Block>
                        <Image
                            source={{
                                uri: userData?.image ?
                                    userData?.image : auth.currentUser?.photoURL,
                            }}
                            // style={styles.avatar}
                            height={95}
                            width={95}
                        />
                        {/* <Image
                            source={{
                                uri: userData?.image,
                            }}
                            alt={userData.name ? userData.name : "userData"}
                            height={95}
                            width={95}
                            rounded="full"
                        />*/}
                        <Text bold size={20} mx={4} my={4} fontSize={"lg"}>
                            Welcome , {userData?.name} !
                        </Text>
                    </Block>

                    <Block>
                        <Text color="gray.500">
                            Shift: Regular Office Hour [{timeIn} - {timeOut}]
                        </Text>
                        <Text bold size={20} fontSize={"lg"} color="gray.500">
                            {moment().format("DD-MM-YYYY")}
                        </Text>
                    </Block>

                    <Block display={'flex'}
                        m={4}
                        p={2}
                        rounded="2xl"
                        backgroundColor="gray.100"
                        justifyContent={"space-evenly"}
                    >
                        <Block>
                            <Image
                                height="55"
                                width="55"
                                rounded="full"
                                alt="no image"
                                source={{
                                    uri: myAttendance.inImage
                                        ? myAttendance.inImage
                                        : "https://media.tarkett-image.com/large/TH_25121916_25131916_25126916_25136916_001.jpg",
                                }}
                                m={2}
                            />
                            <Text bold size={20} textAlign={"center"} fontSize="13px" fontWeight="bold">
                                Jam Masuk
                            </Text>
                            <Text bold size={20} fontWeight={700} color="green">
                                {myAttendance.in ? myAttendance.in : "--:--:--"}
                            </Text>
                        </Block>

                        <Block alignItems={"center"}>
                            <Image
                                height="55"
                                width="55"
                                rounded="full"
                                margin={2}
                                source={{
                                    uri: myAttendance.outImage
                                        ? myAttendance.outImage
                                        : "https://media.tarkett-image.com/large/TH_25121916_25131916_25126916_25136916_001.jpg",
                                }}
                                alt="no image"
                            />
                            <Text bold size={20} textAlign={"center"} fontSize="13px" fontWeight="bold">
                                Jam Keluar
                            </Text>
                            <Text bold size={20} color="red" textAlign={"center"}>
                                {myAttendance.out ? myAttendance.out : "--:--:--"}
                            </Text>
                        </Block>
                    </Block>

                    <Block my={2} mx={4}>
                        {myAttendance.in === undefined && !isClockIn ? (
                            myAttendance.in === undefined &&
                                myAttendance.out === undefined &&
                                isClockOut ? (
                                <AppButton
                                    title="CLOCK OUT"
                                    icon="briefcase-clock"
                                    color={"#ffd600"}
                                    fontColor="black"
                                    onPress={() => setShowModal(true)}
                                />
                            ) : (
                                <></>
                            )
                        ) : myAttendance.in === undefined && isClockIn ? (
                            <AppButton
                                title="CLOCK IN"
                                icon="briefcase-clock-outline"
                                color="#ffd600"
                                fontColor="black"
                                onPress={() => setShowModal(true)}
                            />
                        ) : myAttendance.out === undefined && !isClockOut ? (
                            <></>
                        ) : myAttendance.out === undefined && isClockOut ? (
                            <AppButton
                                title="CLOCK OUT"
                                icon="briefcase-clock"
                                color="#FFD600"
                                fontColor="black"
                                onPress={() => setShowModal(true)}
                            />
                        ) : (
                            <></>
                        )}
                    </Block>

                    <Block my={2} mx={4} mb={24}>
                        {inOut ? (
                            inOut.map((item, i) => {
                                return (
                                    <Block
                                        key={i}
                                        backgroundColor="white"
                                        my={2}
                                        borderRadius="md"
                                        h="auto"
                                    >
                                        <Block
                                            backgroundColor="#ffd600"
                                            h={5}
                                            w="100%"
                                            height={6}
                                            p={1}
                                            roundedTopLeft={"md"}
                                            roundedTopRight={"md"}
                                        >
                                            <Text mx="2" fontSize="xs">
                                                {item.date}
                                            </Text>
                                        </Block>

                                        <Block display={'flex'} justifyContent="space-around" p={2}>
                                            <Block display={'flex'}>
                                                <Image
                                                    source={
                                                        item.inImage
                                                            ? { uri: item.inImage }
                                                            : {
                                                                uri: "https://media.tarkett-image.com/large/TH_25121916_25131916_25126916_25136916_001.jpg",
                                                            }
                                                    }
                                                    alt="kucing"
                                                    height={45}
                                                    width={45}
                                                    m={2}
                                                    rounded="full"
                                                />
                                                <Block alignItems={"center"} mt={2}>
                                                    <Text textAlign={"left"} fontSize="13">
                                                        Jam Masuk
                                                    </Text>
                                                    <Text textAlign={"left"} fontWeight="bold">
                                                        {item.in ? item.in : "--:--:--"}
                                                    </Text>
                                                </Block>
                                            </Block>

                                            <Block display={'flex'}>
                                                <Image
                                                    source={
                                                        item.outImage
                                                            ? { uri: item.outImage }
                                                            : {
                                                                uri: "https://media.tarkett-image.com/large/TH_25121916_25131916_25126916_25136916_001.jpg",
                                                            }
                                                    }
                                                    alt="kucing"
                                                    height={45}
                                                    width={45}
                                                    m={2}
                                                    rounded="full"
                                                />
                                                <Block alignItems={"center"} mt={2}>
                                                    <Text textAlign={"left"} fontSize="13">
                                                        Jam Keluar
                                                    </Text>
                                                    <Text textAlign={"left"} fontWeight="bold">
                                                        {item.out ? item.out : "--:--:--"}
                                                    </Text>
                                                </Block>
                                            </Block>
                                        </Block>
                                    </Block>
                                );
                            })
                        ) : (
                            <Text bold size={20}>Tidak ada data</Text>
                        )}
                    </Block>
                </Block>
            </ScrollView>

            <View style={styles.centeredView}>
                <Modal
                    onClose={() => setShowModal(false)}
                    animationType="slide"
                    transparent={true}
                    visible={showModal}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Block p={1} position="relative">
                                {/* {isPreview ? (
                                    <>
                                        <Block>
                                            <Image
                                                source={{ uri: capturedImage }}
                                                alt={capturedImage}
                                                width="100px"
                                                height="100px"
                                                opacity={loading ? 0.4 : 1}
                                            />
                                        </Block >
                                    </>
                                ) : (
                                    <>
                                        <Text>Camera:</Text>
                                        <CameraScreen opacity={loading ? 0.4 : 1} />
                                    </> 
                                )}*/}
                            </Block>
                            {/* <Text>Camera:</Text> */}
                            <CameraScreen />
                            <Text bold size={20} mb={3} textAlign={"center"}>
                                Submit Attendance
                            </Text>
                            <Button
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => setShowModal(false)}>
                                <Text style={styles.textStyle}>Hide Modal</Text>
                            </Button>
                            {/* {!isPreview ? (
                                <Block display={'flex'} justifyContent="space-between" w={"full"}>
                                    <Button
                                        disabled={!isCameraReady}
                                        onPress={switchCamera}
                                    >
                                        <MaterialCommunityIcons name="camera-switch" size={24} color="black" />
                                    </Button>

                                    <Button
                                        size={"large"}
                                        colorScheme={"green"}
                                        onPress={onSnap}
                                        width={"200px"}
                                        disabled={!isCameraReady}
                                        isDisabled={loading ? true : false}
                                    >
                                        <Block display={'flex'}>
                                            <Text fontSize={"xl"} fontWeight={"bold"} color="white">
                                                Capture{"  "}
                                            </Text>
                                            {loading ? <ActivityIndicator color="warning.800" size="lg" /> : null}
                                        </Block>
                                    </Button>

                                    <Button
                                        disabled={!isCameraReady}
                                        onPress={onHandleCloseModal}
                                    >
                                        <Icon
                                            size="xl"
                                            as={MaterialCommunityIcons}
                                            name={"close-thick"}
                                            color="error.600"
                                        />
                                    </Button>
                                </Block>
                            ) : (
                                <Block display={'flex'} justifyContent="space-between" w={"full"}>
                                    <Button
                                        disabled={!isCameraReady}
                                        icon={
                                            <Icon
                                                size="xl"
                                                as={MaterialCommunityIcons}
                                                name={"delete"}
                                                color="error.600"
                                            />
                                        }
                                        onPress={() => cancelPreview()}
                                    />

                                    <Button
                                        disabled={!isCameraReady}
                                        size={"lg"}
                                        backgroundColorColor={"#ffd600"}
                                        onPress={() => capture()}
                                        w={"200px"}
                                        isDisabled={loading ? true : false}
                                    >
                                        <Block display={'flex'}>
                                            <Text fontSize={"xl"} fontWeight={"bold"} color="black">
                                                Submit{" "}
                                            </Text>
                                            {loading ? <ActivityIndicator /> : null}
                                        </Block>
                                    </Button>

                                    <Button
                                        disabled={!isCameraReady}
                                        onPress={onHandleCloseModal}
                                    >
                                        <Icon
                                            size="xl"
                                            as={MaterialCommunityIcons}
                                            name={"close-thick"}
                                            color="error.600"
                                        />
                                    </Button>
                                </Block>
                            )} */}
                        </View>
                    </View>


                </Modal>
            </View>

        </>
    );


};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 100,
    },
    camera: {
        width: "500px",
        height: "100px",
    },
    buttonContainer: {
        flex: 1,
        backgroundColor: "transparent",
        flexDirection: "row",
        margin: 20,
    },
    button: {
        flex: 0.1,
        alignSelf: "flex-end",
        alignItems: "center",
        width: "100%",
    },
    text: {
        fontSize: 18,
        fontWeight: "bold",
        color: "black",
        backgroundColor: "#ffd600",
        width: 100,
        textAlign: "center",
        padding: 5,
        shadowRadius: 5,
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
    centeredView: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        // marginTop: 22,
    },
    modalView: {
        width,
        backgroundColor: 'white',
        borderRadius: 20,
        // padding: 35,
        alignItems: 'center',
        justifyContent: 'center',
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

export default AttendanceClone;
