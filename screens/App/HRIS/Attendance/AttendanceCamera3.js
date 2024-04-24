import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, ImageBackground, StyleSheet, Alert, Dimensions, ActivityIndicator, Platform, Modal, Image, FlatList } from "react-native";
import { Camera, CameraType } from "expo-camera";
import { Block, Button, Text } from "galio-framework";
import { UploadWithBytes } from "../../../../services/imageUpload";
import moment from "moment";
import { auth } from "../../../../configs/firebase";
import axios from "axios";
import useLocationStore from "../../../../store/location";
import useAuthStore from "../../../../store/user";
import * as ImageManipulator from 'expo-image-manipulator';
import { manipulateAsync } from "expo-image-manipulator";
import Theme from "../../../../constants/Theme";
// import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { getDistance } from 'geolib';
import SelectDropdown from "react-native-select-dropdown";
import { getCollectionFirebase } from "../../../../apis/firebaseApi";
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { insertPixelsToLink } from "../../../../services/utils";
import { useIsFocused } from "@react-navigation/native";
import { ScrollView } from "react-native";


const { width, height } = Dimensions.get("window");
const screenRatio = height / width;
const boxWidth = 200;



export default function AttendanceCamera3({ route, navigation }) {
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [previewVisible, setPreviewVisible] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.front);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRatio, setSelectedRatio] = useState("4:3");
    const [modalVisible, setModalVisible] = useState(true);
    const [isRatioSet, setIsRatioSet] = useState(false);
    const [imagePadding, setImagePadding] = useState(0);
    const [currentAddress, setCurrentAddress] = useState("");
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [preciseLocation, setPreciseLocation] = useState({
        latitude: 0,
        longitude: 0
    });
    const [selectedOffice, setSelectedOffice] = useState({
        latitude: -6.191113256553788,
        longitude: 106.71128913990316
    });
    const [listOffices, setListOffices] = useState([]);
    const [refreshingLocation, setRefreshingLocation] = useState(false);

    const { latitude, longitude, setLatitude, setLongitude } = useLocationStore();
    const isFocused = useIsFocused();
    const { userData } = useAuthStore();


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


    // const { latitude, longitude } = useLocationStore();


    const cameraRef = useRef();



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
            console.log("not an android!!");
            setIsRatioSet(true);
        };
    };

    const onReady = async () => {
        if (!isRatioSet) {
            await prepareRatio();
        };
    };

    const uriToBlob = (uri) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.onload = function () {
                // return the blob
                resolve(xhr.response)
            }
            xhr.onerror = function () {
                reject(new Error('uriToBlob failed'))
            }
            xhr.responseType = 'blob'
            xhr.open('GET', uri, true)

            xhr.send(null)
        });
    };

    const takePicture = async () => {
        let photo = await cameraRef.current.takePictureAsync();
        const type = `attendances/${auth.currentUser.uid
            }/live-attendance/${moment().format("MMMM-YYYY")}`;

        const title = `${auth.currentUser.uid} - ${moment().format()}`;


        try {
            if (type === CameraType.front) {
                photo = await ImageManipulator.manipulateAsync(
                    photo.uri || photo.localUri,
                    [
                        { rotate: 270 },
                        { flip: FlipType.Vertical },
                        {
                            resize: {
                                height: 1920,
                            },
                        },
                    ],
                    { compress: 0.2, format: SaveFormat.PNG, base64: true }
                );
            }
        } catch (error) {
            Alert.alert("error manipulating image")
            console.log("error manipulating", error)
        };

        setPreviewVisible(true);
        setCapturedImage(photo);
        setIsLoading(true);

        let blob;

        try {
            blob = await uriToBlob(photo.uri);
            // const blobFromBase64 = dataURLtoFile(photo.uri, "x");

            if (!blob) return Alert.alert(`Error xhr : error`);
            // blob = await uriToBlob(photo.uri)


        } catch (error) {
            console.log("error uri to blob", error);
        }


        let uploadAttendanceImage;
        try {
            uploadAttendanceImage = await UploadWithBytes(title, type, blob);
        } catch (error) {
            console.log("error upload to firebase::::", error)
            Alert.alert("There is something wrong, please try again later")
            return navigation.goBack();
        };


        const convertedLink = insertPixelsToLink(uploadAttendanceImage?.url);


        try {
            const submitData = {
                image: convertedLink,
                latitude: latitude,
                longitude: longitude,
                office_uid: selectedOffice.id
            };
            console.log("data that meant to be sent to sql ::::", submitData)

            const config = {
                method: "post",
                url: "https://asia-southeast2-deoapp-indonesia.cloudfunctions.net/hris/api/attendance",
                headers: {
                    "Authorization": auth.currentUser.stsTokenManager.accessToken,
                    "company": userData?.currentCompany ? userData?.currentCompany : "-",
                    "project": userData?.currentProject ? userData?.currentProject : "-"
                },
                data: submitData
            };
            // console.log("config::::", config)


            const submitResult = await axios(config);

            console.log("this is submitResult::::", submitResult.data)
            if (submitResult?.data?.status === true) {
                Alert.alert("Attendance successfully submitted!, time : " + moment
                    .parseZone(submitResult?.data?.data?.clock_out)
                    .local()
                    .format("HH : mm : ss"))
                console.log("result::::", submitResult.data)
                setCapturedImage(null);
            } else {
                Alert.alert(submitResult.data.message);
            }
        } catch (error) {
            Alert.alert(error);
            console.log("error submit to deoapphrisattendance::::", error)
        } finally {
            setIsLoading(false);
            navigation.goBack()
        };
    };

    const getAddress = async () => {
        if (latitude === 0 || longitude === 0) {
            setIsSearchingLocation(true)
        } else setIsSearchingLocation(false);

        try {
            const address = await Location.reverseGeocodeAsync({ latitude, longitude });
            setCurrentAddress(address[0]);

            const preciseLoc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.BestForNavigation,
                timeInterval: 4000
            });

            setPreciseLocation({
                ...preciseLocation,
                latitude: preciseLoc.coords.latitude,
                longitude: preciseLoc.coords.longitude,
            });

        } catch (error) {
            console.warn(error);
        } finally {
            setIsSearchingLocation(false);
        };
    };


    const fetchLocation = async () => {
        setRefreshingLocation(true);
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
        } finally {
            setRefreshingLocation(false);
        };
    };



    useEffect(() => {
        // prepareRatio();
        requestPermission();
        getAddress();
        getOfficeAddresses();
    }, []);

    useEffect(() => {
        calculateDistance();
        return () => {
            setCapturedImage(false);
            setIsLoading(false);
            setPreviewVisible(false);
        };

    }, [selectedOffice]);



    if (!permission) {
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
    };




    if (modalVisible) {
        // if (isSearchingLocation)
        //     return <View style={[styles.centeredView, { backgroundColor: "white" }]}>
        //         <Image
        //             source={require("../../../../assets/searching_for_location.gif")}
        //             style={{ width: width * 0.25, height: width * (4 / 9) }}
        //         />
        //     </View>
        return <View style={[styles.centeredView, { backgroundColor: Theme.COLORS.PRIMARY }]}>
            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={() => {
                    // Alert.alert('Modal has been closed.');
                    setModalVisible(!modalVisible);
                }}>
                <ScrollView>


                    <Block
                        id="container"
                        backgroundColor={Theme.COLORS.PRIMARY}
                        height={height}

                    >
                        {/* {
                                // isSearchingLocation ?
                                false ?
                                    <Image
                                        source={require("../../../../assets/searching_for_location.gif")}
                                        style={styles.map}
                                    />
                                    :
                                    <MapView
                                        style={styles.map}
                                        initialRegion={{
                                            latitude: selectedOffice?.latitude,
                                            longitude: selectedOffice?.longitude,
                                            latitudeDelta: 0.008,
                                            longitudeDelta: 0.01,
                                        }}
                                        region={{
                                            latitude: selectedOffice?.latitude,
                                            longitude: selectedOffice?.longitude,
                                            latitudeDelta: 0.008,
                                            longitudeDelta: 0.01,
                                        }}
                                        mapType="standard"
                                        provider={PROVIDER_GOOGLE}
                                    >
                                        <Marker
                                            coordinate={{ latitude: parseInt(preciseLocation.latitude), longitude: parseInt(preciseLocation.longitude) }}
                                            title={currentAddress ? currentAddress?.name : "My Location"}
                                        >
                                            <Block>
                                                <Image source={require("../../../../assets/person-location.png")} style={styles.pin} />
                                            </Block>
                                        </Marker>
                                        {selectedOffice && <Marker
                                            coordinate={{ latitude: parseInt(selectedOffice?.latitude), longitude: parseInt(selectedOffice?.longitude) }}
                                            title={selectedOffice ? selectedOffice?.name : "My Office"}
                                        />}
                                    </MapView>} */}

                        <Block style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height
                        }}>
                            <SelectDropdown
                                data={listOffices}
                                buttonStyle={{
                                    width: width * 0.95,
                                    marginTop: 10
                                }}
                                defaultButtonText={listOffices[0]?.address}
                                onSelect={(selectedItem, index) => {
                                    setSelectedOffice(selectedItem)
                                }}
                                buttonTextAfterSelection={(selectedItem, index) => {
                                    // text represented after item is selected
                                    // if data array is an array of objects then return selectedItem.property to render after item is selected
                                    return selectedItem?.address
                                }}
                                rowTextForSelection={(item, index) => {
                                    // text represented for each item in dropdown
                                    // if data array is an array of objects then return item.property to represent item in dropdown
                                    return item?.address
                                }}
                            />




                            <Text bold center color="white" size={20} marginTop={10}>
                                Your distance to office is : {renderDistance()}
                            </Text>

                            <Text center color="white" size={10} marginTop={10}>
                                You have to be within {parseInt(selectedOffice?.radius)} meters to submit attendance!
                            </Text>

                            {calculateDistance() <= parseInt(selectedOffice?.radius) ?
                                <Button onPress={() => setModalVisible(false)} style={{ width: width * 0.95, backgroundColor: Theme.COLORS.SUCCESS, display: 'flex', flexDirection: 'row' }}>
                                    <Entypo name="camera" size={20} color="white" style={{ marginHorizontal: 10 }} />
                                    <Text color="white" bold>Submit Attendance</Text>
                                </Button> :
                                calculateDistance() > parseInt(selectedOffice?.radius) ?
                                    <Button disabled style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.4)", width: "100%", padding: 20, height: "auto" }}>
                                        <Text center color="white">You're too far away from office!</Text>
                                    </Button> : <></>}




                            <Block column>
                                <Button onPress={() => navigation.goBack()} style={{ backgroundColor: Theme.COLORS.ERROR, display: 'flex', flexDirection: 'row' }}>
                                    <Ionicons name="arrow-back" size={24} color="white" />
                                    <Text color="white" bold>Back</Text>
                                </Button>
                                <Button
                                    width={undefined}
                                    onPress={fetchLocation}
                                    loading={refreshingLocation}
                                    disabled={refreshingLocation}
                                >
                                    {refreshingLocation ? "Getting your location..." : "Refresh My Location"}
                                </Button>
                            </Block>

                        </Block>
                    </Block>
                </ScrollView>

            </Modal>
        </View>
    };

    return (
        <View
            style={{
                flex: 1,
            }}
        >
            {isLoading && <Block style={{ position: "absolute", zIndex: 2, backgroundColor: "rgba(145, 145, 145, 0.4)" }}
                height={height} width={width}
                center middle>
                <ActivityIndicator size="large" />
            </Block>}
            {previewVisible && capturedImage !== null ? (
                <ImageBackground
                    source={{ uri: capturedImage.uri }}
                    style={{
                        flex: 1,
                    }}
                >
                </ImageBackground>
            ) : (
                isFocused ?
                    <>
                        <Camera
                            type={type}
                            ref={cameraRef}
                            ratio={selectedRatio}
                            onCameraReady={onReady}
                            style={[
                                styles.camera,
                                { marginBottom: imagePadding, marginTop: imagePadding, flex: 1 },
                            ]}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    backgroundColor: "transparent",
                                    flexDirection: "row",
                                }}
                            >

                                <View
                                    style={{
                                        position: "absolute",
                                        bottom: 0,
                                        flexDirection: "row",
                                        flex: 1,
                                        width: "100%",
                                        padding: 20,
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <View
                                        style={{
                                            alignSelf: "center",
                                            flex: 1,
                                            alignItems: "center",
                                        }}
                                    >
                                        <TouchableOpacity
                                            onPress={takePicture}
                                            style={{
                                                width: 70,
                                                height: 70,
                                                bottom: 0,
                                                borderRadius: 50,
                                                backgroundColor: calculateDistance() > parseInt(selectedOffice?.radius) ?
                                                    Theme.COLORS.MUTED :
                                                    Theme.COLORS.SUCCESS,
                                                justifyContent: "center",
                                                alignItems: "center"
                                            }}
                                            disabled={calculateDistance() > parseInt(selectedOffice?.radius)}
                                        >
                                            <Text bold color="white">Submit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={{
                                                position: "absolute",
                                                top: "5%",
                                                left: "5%",
                                            }}
                                            onPress={() => {
                                                setType(
                                                    type === Camera.Constants.Type.back
                                                        ? Camera.Constants.Type.front
                                                        : Camera.Constants.Type.back
                                                );
                                            }}
                                        >
                                            <Text style={{ fontSize: 20, marginBottom: 10, color: "white" }}>
                                                {" "}
                                                Flip{" "}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={{
                                                position: "absolute",
                                                top: "5%",
                                                right: "5%",
                                            }}
                                            onPress={() => navigation.goBack()}
                                        >
                                            <Text style={{ fontSize: 20, marginBottom: 10, color: "white" }}>
                                                {" "}
                                                Back{" "}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Camera>
                    </>
                    :
                    <></>
            )}
        </View>
    )
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
        // width: "100%",
    },
    camera: {
        justifyContent: "flex-end",
        width: width,
        height: height,
    },
    buttonContainer: {
        position: "absolute",
        bottom: 10,
        // width: "100%",
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
        // flex: 1,
        display: 'flex',
        flexDir: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: height,
        zIndex: 200
        // marginTop: 22,
        // position: "absolute",
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
        width: width * 0.95,
        height: width,
    },
    perimeter: {
        width: boxWidth,
        height: boxWidth,
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center',
        backgroundColor: 'green',
        opacity: 0.2,
        borderRadius: 200,
        borderWidth: 4,
        borderColor: "red",
        // marginBottom: -boxWidth,
        zIndex: 2
    },
    pin: {
        height: height * 0.05,
        width: height * 0.05,
        alignSelf: 'center',
        justifyContent: 'center',
        opacity: 1,
    }
});