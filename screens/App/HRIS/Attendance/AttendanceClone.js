import {
    StyleSheet,
    View,
    Modal,
    Alert,
    Platform,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
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
import { useIsFocused, useNavigation } from "@react-navigation/native";
import SelectDropdown from "react-native-select-dropdown";
import { getDistance } from "geolib";
import useLocationStore from "../../../../store/location";
import { Ionicons } from '@expo/vector-icons';
import { getCollectionFirebase } from "../../../../apis/firebaseApi";
import { Entypo } from '@expo/vector-icons';
import { createHrisFirebase } from "../../../../apis/Hris";


const { width, height } = Dimensions.get('window');
const screenRatio = height / width;


const AttendanceClone = () => {
    const { userData } = useAuthStore();
    const navigation = useNavigation();
    const [permission, requestPermission] = Camera.useCameraPermissions();

    const [inOut, setInOut] = useState([]);

    const [isRatioSet, setIsRatioSet] = useState(false);
    const [selectedRatio, setSelectedRatio] = useState("4:3");
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
    const [listOffices, setListOffices] = useState([]);
    const [loading, setLoading] = useState(false);

    const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
    const [isPreview, setIsPreview] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [selectedOffice, setSelectedOffice] = useState({
        latitude: -6.191113256553788,
        longitude: 106.71128913990316
    });
    const [refreshingLocation, setRefreshingLocation] = useState(false);
    const { latitude, longitude, setLatitude, setLongitude } = useLocationStore();
    const [modalVisible, setModalVisible] = useState(false);
    const [imagePadding, setImagePadding] = useState(0);
    const [process, setProcess] = useState({
        uploading: false,
        submitting: false
    });


    const isFocused = useIsFocused();
    const cameraRef = useRef();


    const fetchLocation = async () => {
        setRefreshingLocation(true);
        try {
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.BestForNavigation
            });
            // console.log("setting latitude to store", location?.coords?.latitude)
            // console.log("setting longitude to store", location?.coords?.longitude)
            setLatitude(location?.coords?.latitude);
            setLongitude(location?.coords?.longitude);
        } catch (error) {
            console.log("error fetching location", error);
        } finally {
            setRefreshingLocation(false);
        };
    };


    const getOfficeAddresses = async () => {
        // console.log("running get office addresses..")
        const newObj = {
            title: "My Offices",
            address: "My Address",
            latitude,
            longitude,
            radius: 300
        }
        // console.log("runnig...")
        try {
            const conditions = [
                {
                    field: 'employee',
                    operator: 'array-contains',
                    value: auth.currentUser.uid
                }
            ];

            const sortBy = null;
            const limitValue = null;
            const startAfterData = null;
            const results = await getCollectionFirebase('offices', { conditions }, { sortBy }, { limitValue }, { startAfterData });
            if (results !== undefined && results?.length > 0) {
                // setListOffices([...results, newObj]);
                setListOffices(results);
                // console.log([...results, newObj]);
                setSelectedOffice(results[0])
            };
            // console.log(results, "results")
        } catch (error) {
            console.log("error on offices", error)
            Alert.alert("error on offices", error)
        };
    };
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
        setModalVisible(false);
        setIsPreview(false);
        setCapturedImage(null);
    };

    const prepareRatio = async () => {
        let desiredRatio = "4:3";
        if (Platform.OS === "android") {
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
            setSelectedRatio(desiredRatio);
            setIsRatioSet(true);
            setImagePadding(remainder);
        } else {
            // console.log("not an android!!");
            setIsRatioSet(true);
        };
    };

    const onCameraReady = async () => {
        setIsCameraReady(true);
        if (!isRatioSet) {
            await prepareRatio();
        };
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
                    setCapturedImage(data?.uri);
                    setIsPreview(true);
                    setLoading(true);
                    capture(data?.base64)
                }
            }
        } catch (error) {
            setLoading(false);
            console.log(error, "error onSnap");
        }
    };


    const capture = async (base64 = undefined) => {
        // const currentDate = moment().format("DD-MM-YYYY hh:mm:ss");
        // const fileName = `${userData.uid} -${currentDate}`;

        // const manipResult = await ImageManipulator.manipulateAsync(
        //     base64 || capturedImage,
        //     [{ resize: { width: 300 } }],
        //     { compress: 0.2, format: ImageManipulator.SaveFormat.PNG }
        // );

        // const response = await fetch(manipResult.base64);
        // const blob = await response.blob();

        const dataDropbox = {
            companyId: userData?.currentCompany ? userData?.currentCompany : "8NCG4Qw0xVbNR6JCcJw1",
            projectId: userData?.currentProject ? userData?.currentProject : "8NCG4Qw0xVbNR6JCcJw1",
            module: 'attendance',
            base64Data: base64,
            mimeType: 'image/png', // Ganti dengan tipe MIME yang sesuai
            fileName: `${auth?.currentUser?.uid}-${moment().unix()}.png` || ''
        }

        const configDropbox = {
            method: 'post',
            url: 'https://asia-southeast2-deoapp-indonesia.cloudfunctions.net/dropbox-upload_file_base64',
            data: dataDropbox,
            headers: {
                'Authorization': 'pFa08EJkVRoT7GDiqk1',
                'Content-Type': 'application/json'
            }
        };
        // console.log("configDropbox::", configDropbox)


        let responseDropbox;
        try {
            setProcess((prev) => ({ ...prev, uploading: true }));
            responseDropbox = await axios(configDropbox);

            if (responseDropbox) {
                // console.log('responseDropbox', responseDropbox.data);
                setProcess({ uploading: false, submitting: false });
            };
        } catch (error) {
            setProcess({ uploading: false, submitting: false });
            setLoading(false);
            setIsPreview(false);
            setCapturedImage(null);
            Alert.alert(error.message);
            navigation.goBack()
            console.log(error, 'error upload dropbox base64')
        }



        if (responseDropbox.data) {
            setProcess({ uploading: false, submitting: false });
            const linkImage = responseDropbox.data.data.link.link;

            const submitData = {
                image: linkImage,
                latitude: latitude,
                longitude: longitude,
                office_uid: selectedOffice.id
            };
            const submitDataFirebase = {
                image: linkImage,
                latitude: latitude,
                longitude: longitude,
                office_uid: selectedOffice.id
            };

            // console.log(submitData, "::: submit data to sql")

            try {
                const config = {
                    method: "post",
                    url: "https://asia-southeast2-deoapp-indonesia.cloudfunctions.net/hris/api/attendance",
                    headers: {
                        "Authorization": auth.currentUser.stsTokenManager.accessToken,
                        "company": userData?.currentCompany ? userData?.currentCompany : "8NCG4Qw0xVbNR6JCcJw1",
                        "project": userData?.currentProject ? userData?.currentProject : "8NCG4Qw0xVbNR6JCcJw1"
                    },
                    data: submitData
                };

                setProcess((prev) => ({ ...prev, submitting: true }));
                const submitResult = await axios(config);
                try {
                    await createHrisFirebase(userData, 'attendances', submitDataFirebase);
                } catch (error) {
                    console.log(error.message, 'error saving to firebase');
                };
 
                // console.log("this is submitResult::::", submitResult.data)
                if (submitResult?.data?.status === true) {
                    Alert.alert("Attendance successfully submitted!, time : " + moment
                        .parseZone(submitResult?.data?.data?.clock_out)
                        .local()
                        .format("HH : mm : ss"))
                    // console.log("result::::", submitResult.data)
                    setCapturedImage(null);
                    setProcess({ uploading: false, submitting: false });
                } else {
                    Alert.alert(submitResult.data.message);
                    setProcess({ uploading: false, submitting: false });
                }
            } catch (error) {
                Alert.alert(error);
                // console.log("error submit to deoapphrisattendance::::", error)
            } finally {
                setLoading(false);
                setIsPreview(false);
                setCapturedImage(null);
                setProcess({ uploading: false, submitting: false });
                navigation.goBack()
            };

        } else {
            setLoading(false);
            setIsPreview(false);
            setCapturedImage(null);
            navigation.goBack()
            Alert.alert("Failed to upload image")
        }
        setLoading(false);
        setIsPreview(false);
        setCapturedImage(null);
        navigation.goBack()
    };


    const cancelPreview = async () => {
        setIsPreview(false);
        await cameraRef.current.resumePreview();
    };
    const calculateDistance = () => {
        const distanceToOffice = getDistance(
            { latitude: selectedOffice?.latitude, longitude: selectedOffice?.longitude },
            { latitude, longitude }
        );

        return parseInt(distanceToOffice);
    };

    const renderDistance = () => {
        if (calculateDistance() > 1000) return `${(calculateDistance() / 1000)?.toFixed(2)} km`
        return `${calculateDistance()} meters`
    };



    useEffect(() => {
        requestPermission();
        getLocation();
        getOfficeAddresses();

        return () => {
            setIsPreview(false);
            setCapturedImage(null);
            setIsCameraReady(false);
        }
    }, []);

    useEffect(() => {
        if (!selectedOffice?.latitude || !selectedOffice?.longitude) {
            Alert.alert('Oops!', `${selectedOffice?.title} seem does't have either latitude or latitude, please contact your company to fill out office details correctly.`, [
                {
                    text: 'Go Back',
                    onPress: () => navigation.goBack(),
                    style: 'cancel',
                },
            ])
        };
    }, [selectedOffice])




    const CameraScreen = () => {
        if (permission === null)
            // Camera permissions are still loading
            return <Text>no permission??</Text>

        if (permission === false) {
            return <Text color='red'>No access to camera</Text>;
        }

        if (permission) {
            return (
                <Camera
                    ref={cameraRef}
                    type={cameraType}
                    ratio={selectedRatio}
                    onCameraReady={onCameraReady}
                    style={[
                        styles.camera,
                        { marginBottom: imagePadding, marginTop: imagePadding, flex: 1 },
                    ]}
                >

                    <View
                        style={{
                            position: 'absolute',
                            bottom: 50,
                            alignItems: 'center',
                            justifyContent: 'center',
                            display: 'flex',
                            alignSelf: 'center',
                        }}
                    >
                        <Block
                            display={'flex'}
                            flexDirection='row'
                            justifyContent="space-between"
                            w={"full"}
                        >
                            <Button
                                disabled={!isCameraReady}
                                onPress={switchCamera}
                                color='transparent'
                                style={{
                                    width: 100,
                                }}
                            >
                                <Text bold color="white">Switch</Text>
                            </Button>
                            <Button
                                disabled={!isCameraReady}
                                backgroundColorColor={"#ffd600"}
                                onPress={onSnap}
                                w={"200px"}
                                isDisabled={loading ? true : false}
                                style={{
                                    width: 100
                                }}
                            >
                                <Block display={'flex'} flexDirection='row'>
                                    <Text bold color="white">
                                        Submit{" "}
                                    </Text>
                                    {loading ? <ActivityIndicator /> : null}
                                </Block>
                            </Button>
                            <Button
                                style={{
                                    width: 100
                                }}
                                disabled={!isCameraReady}
                                onPress={onHandleCloseModal}
                                color='transparent'
                            >
                                <Text bold color="white">Close</Text>
                            </Button>
                        </Block>
                    </View>
                </Camera>
            );
        }
    };



    if (modalVisible && isFocused) return (
        <View style={styles.centeredView}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
            >
                {isPreview ?
                    <Image
                        source={capturedImage && capturedImage}
                        style={{
                            width, height
                        }}
                        alt="no photo"
                    >
                        {loading && <View
                            style={{
                                position: 'absolute',
                                height, width,
                                backgroundColor: 'rgba(0,0,0,0.3)',
                                zIndex: 2,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <ActivityIndicator size={'large'} color='white' />
                            {process?.uploading ? <Text backgroundColor={'gray'} padding={2}>Uploading Image...</Text> :
                                process?.submitting ? <Text backgroundColor={'gray'} padding={2}>Submitting Attendance...</Text> :
                                    <></>}
                        </View>
                        }
                        <View
                            style={{
                                position: 'absolute',
                                bottom: 50,
                                alignItems: 'center',
                                justifyContent: 'center',
                                display: 'flex',
                                alignSelf: 'center',
                            }}
                        >
                            <Block
                                display={'flex'}
                                flexDirection='row'
                                justifyContent="space-between"
                                w={"full"}
                            >
                                <Button
                                    disabled={!isCameraReady}
                                    onPress={() => cancelPreview()}
                                    style={{
                                        width: 100
                                    }}
                                >
                                    <Text bold color="white">Cancel</Text>
                                </Button>
                                {/* <Button
                                        disabled={!isCameraReady}
                                        backgroundColorColor={"#ffd600"}
                                        onPress={onSnap}
                                        w={"200px"}
                                        isDisabled={loading ? true : false}
                                        style={{
                                            width: 100
                                        }}
                                    >
                                        <Block display={'flex'}>
                                            <Text bold color="white">
                                                Submit{" "}
                                            </Text>
                                            {loading ? <ActivityIndicator /> : null}
                                        </Block>
                                    </Button> */}
                                <Button
                                    style={{
                                        width: 100
                                    }}
                                    disabled={!isCameraReady}
                                    onPress={onHandleCloseModal}
                                >
                                    <Text bold color="white">Close</Text>
                                </Button>
                            </Block>
                        </View>

                    </Image>
                    :
                    <CameraScreen opacity={loading ? 0.8 : 1} />
                }

                {/* <Button
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => setShowModal(false)}>
                        <Text style={styles.textStyle}>Hide Modal</Text>
                    </Button> */}
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
                        <></>
                    )} */}
            </Modal>
        </View>
    )


    return (
        <>
            {/* <Block
                // id="container"
                backgroundColor={Theme.COLORS.PRIMARY}
                height={height}

            > */}
            <Block style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                backgroundColor: Theme.COLORS.PRIMARY,
                alignItems: 'center',
                height,
            }}>
                <Text
                    style={{
                        marginTop: 10,
                        fontSize:
                            Platform.OS === "android"
                                ? 22
                                : Platform.OS === "ios" && !iPhoneNotch
                                    ? 17
                                    : 22,
                        fontWeight: "600",
                    }}
                    allowFontScaling={false}
                    color={Theme.COLORS.SECONDARY}
                >
                    Schedule:
                    {selectedOffice?.startHour && selectedOffice?.endHour ?
                        `${selectedOffice?.startHour} - ${selectedOffice?.endHour}` :
                        "No Start and End Hour"}
                </Text>
                <SelectDropdown
                    data={listOffices}
                    buttonStyle={{
                        width: width * 0.95,
                        marginTop: 10
                    }}
                    defaultButtonText={listOffices[0]?.title || listOffices[0]?.address}
                    onSelect={(selectedItem, index) => {
                        setSelectedOffice(selectedItem)
                    }}
                    buttonTextAfterSelection={(selectedItem, index) => {
                        // text represented after item is selected
                        // if data array is an array of objects then return selectedItem.property to render after item is selected
                        return selectedItem?.title || selectedItem?.address
                    }}
                    rowTextForSelection={(item, index) => {
                        // text represented for each item in dropdown
                        // if data array is an array of objects then return item.property to represent item in dropdown
                        return item?.title || item?.address
                    }}
                />
                <Text bold center color="white" size={20} marginTop={10}>
                    Your distance to office is : {renderDistance()}
                </Text>

                <Text center color="white" size={10} marginTop={10}>
                    You have to be within {parseInt(selectedOffice?.radius)} meters to submit attendance!
                </Text>

                {calculateDistance() <= parseInt(selectedOffice?.radius) ?
                    <Button onPress={() => setModalVisible(true)} style={{ width: width * 0.95, backgroundColor: Theme.COLORS.SUCCESS, display: 'flex', flexDirection: 'row' }}>
                        <Entypo name="camera" size={20} color="white" style={{ marginHorizontal: 10 }} />
                        <Text color="white" bold>Submit Attendance</Text>
                    </Button> :
                    calculateDistance() > parseInt(selectedOffice?.radius) ?
                        <Button disabled style={{ width: width * 0.95, backgroundColor: "rgba(255,255,255,0.4)", padding: 20, height: "auto" }}>
                            <Text center color="white">You're too far away from office!</Text>
                        </Button> : <></>}
                <Block row>
                    <Button
                        onPress={() => navigation.goBack()}
                        style={{
                            backgroundColor: Theme.COLORS.ERROR,
                            display: 'flex',
                            flexDirection: 'row'
                        }}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                        <Text color="white" bold>Back</Text>
                    </Button>
                    {/* <Button
                        width={theme.SIZES.BASE}
                        onPress={fetchLocation}
                        loading={refreshingLocation}
                        disabled={refreshingLocation}
                        color='orange'
                    >
                        <Block row alignItems={'center'} justifyContent={'center'}>
                            <MaterialCommunityIcons marginHorizontal={12} name="reload-alert" size={24} color="white" />
                            <Text color="white" bold>{refreshingLocation ? "Getting your location..." : "Refresh My Location"}</Text>
                        </Block>
                    </Button> */}
                    <Button
                        onPress={fetchLocation}
                        loading={refreshingLocation}
                        disabled={refreshingLocation}
                        style={{
                            backgroundColor: Theme.COLORS.WARNING,
                            display: 'flex',
                            flexDirection: 'row'
                        }}
                    >
                        <MaterialCommunityIcons marginHorizontal={2} name="reload-alert" size={24} color="white" />
                        {refreshingLocation ?
                            <Text color="white" bold>Getting your location...</Text>

                            :
                            <>
                                <Block column center>
                                    <Text color="white" bold>Refresh</Text>
                                    <Text color="white" bold>  My Location</Text>
                                </Block>
                            </>
                        }

                    </Button>
                </Block>

            </Block>
            {/* </Block> */}



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
        // width: "500px",
        // height: "100px",
        justifyContent: "flex-end",
        width: width,
        height: height,
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
        display: 'flex',
        flexDir: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: height,
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
