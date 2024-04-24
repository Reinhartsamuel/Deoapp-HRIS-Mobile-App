import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, ImageBackground, StyleSheet, Alert, Dimensions, ActivityIndicator, Platform, Modal, Image, StatusBar, SafeAreaView, KeyboardAvoidingView, FlatList, TextInput } from "react-native";
import { Camera, CameraType } from "expo-camera";
import { Block, Button, Input, Text, theme } from "galio-framework";
import { UploadWithBytes } from "../../../../services/imageUpload";
import moment from "moment";
import { auth } from "../../../../configs/firebase";
import axios from "axios";
import useLocationStore from "../../../../store/location";
import useAuthStore from "../../../../store/user";
import { manipulateAsync } from "expo-image-manipulator";
import Theme from "../../../../constants/Theme";
// import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { getDistance } from 'geolib';
import SelectDropdown from "react-native-select-dropdown";
import { addDocumentFirebase, getCollectionFirebase, setDocumentFirebase } from "../../../../apis/firebaseApi";
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { useIsFocused } from "@react-navigation/native";
import { Entypo } from '@expo/vector-icons';
import { iPhoneNotch } from "../../../../constants/utils";




const { width, height } = Dimensions.get("window");
const screenRatio = height / width;
const boxWidth = 200;

const offices = [
    {
        name: "LTD Experience Center",
        latitude: -6.284151,
        longitude: 106.807341
    },
    {
        name: "LTD Jasa Desain Interior & Arsitek",
        latitude: -6.271583,
        longitude: 106.821831
    },
    {
        name: "LTD Gedung Haery Kemang",
        latitude: -6.27429,
        longitude: 106.81995
    },
    {
        name: "Project Bekasi",
        latitude: -6.19028695,
        longitude: 106.7116815
    },
    {
        name: "Kantor Edrus",
        latitude: -6.19028695,
        longitude: 106.7116815
    }
];


export default function AttendanceCamera3({ route, navigation }) {
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [previewVisible, setPreviewVisible] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRatio, setSelectedRatio] = useState("4:3");
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisible2, setModalVisible2] = useState(false);
    const [isRatioSet, setIsRatioSet] = useState(false);
    const [imagePadding, setImagePadding] = useState(0);
    const [currentAddress, setCurrentAddress] = useState("");
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [preciseLocation, setPreciseLocation] = useState({
        latitude: 0,
        longitude: 0
    });
    const [dealsList, setDealsList] = useState([]);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [name, setName] = useState("");
    const [selectedOffice, setSelectedOffice] = useState(offices[0]);
    const [listOffices, setListOffices] = useState([]);
    const [list, setList] = useState([]);
    const [currentAttendance, setCurrentAttendance] = useState({});


    const { latitude, longitude } = useLocationStore();

    const cameraRef = useRef();
    const isFocused = useIsFocused();


    const { userData } = useAuthStore();


    const getOfficeAddresses = async () => {
        // console.log("runnig...")
        const conditions = [];
        const sortBy = null;
        const limitValue = null;
        const startAfterData = null;

        try {
            const results = await getCollectionFirebase('offices_address', { conditions }, { sortBy }, { limitValue }, { startAfterData });
            if (results !== undefined && results?.length > 0) {
                setListOffices(results);
            };
        } catch (error) {
            console.log("error on offices", error)
            Alert.alert("error on offices", error)
        };
    };

    const getDeals = async () => {
        const config = {
            url: 'https://asia-southeast2-lifetime-design-erp.cloudfunctions.net/production/api/v1/crm/lists/deal-by-owner?owner=upWfyxvgCiXc2MNecjnbGx10cA03',
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.currentUser.stsTokenManager.accessToken}`
            }
        };

        try {
            const result = await axios(config);
            if (result?.data?.rows?.length > 0) setDealsList(result?.data?.rows);
            // console.log("this is the result of deals:::", result.data);
        } catch (error) {
            console.log("error getting deals", error);
        };
    };

    const calculateDistance = () => {
        const distanceToOffice = getDistance(
            { latitude: selectedOffice?.latitude, longitude: selectedOffice?.longitude },
            { latitude, longitude }
        );

        return parseInt(distanceToOffice);
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


    const handleError = (error) => {
        navigation.navigate("LiveAttendanceStack")
        setIsLoading(false);
        return Alert.alert(error.message);
    };


    const handleSubmitAttendances = async () => {
        // setModalVisible(false);
        // setModalVisible2(false);
        setIsLoading(true);
        try {
            const blob = await uriToBlob(capturedImage.uri);
            if (!blob) return Alert.alert(`Error xhr : error`);

            await uploadingImage(blob);
        } catch (error) {
            console.log("error uri to blob", error);
            handleError(error)
        } finally {
            setIsLoading(false);
        };
    };


    const uploadingImage = async (blobData) => {
        const type = `attendances/non-management/=${selectedDeal.title}/live-attendance/${moment().format("MMMM-YYYY")}`;
        const title = `${selectedDeal}- ${moment().format()}`;

        try {
            const uploadedImg = await UploadWithBytes(title, type, blobData);
            console.log("uploadedImg::::::", uploadedImg);
            await postAttendance(uploadedImg.url);
        } catch (error) {
            console.log("uploadingImage error", error)
            handleError(error)
        };
    };


    const postAttendance = async (url) => {
        const submitData = {
            deal_id: selectedDeal.id,
            manager_uid: auth.currentUser.uid,
            periode: moment().format("YYYY-MM-DD"),
            image_url: url,
            details: name
        };
        console.log(submitData, "::::submitData")

        try {
            await addDocumentFirebase(
                'non_management_attendances',
                submitData,
                userData?.company_id ||
                userData?.company?.id ||
                "-"
            );


            Alert.alert("Attendance submitted " + selectedDeal?.title + " " + moment().format("dddd, dd MMM YYYY"));
            setCapturedImage(null);
            setModalVisible(false);
            setModalVisible2(false);
            await getCurrentAttendance();
        } catch (error) {
            handleError(error);
            console.log("error post attendance", error);
        } finally {
            setIsLoading(false)
        };
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
        };
    };

    const onReady = async () => {
        if (!isRatioSet) {
            await prepareRatio();
        };
    };

    const takePicture = async () => {
        let photo = await cameraRef.current.takePictureAsync();
        try {
            if (type === CameraType.front) {
                photo = await manipulateAsync(
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
                    { compress: 0.1, format: SaveFormat.PNG, base64: false }
                );
            }
        } catch (error) {
            Alert.alert("error manipulating image");
            console.log("error manipulating", error);
        };

        setPreviewVisible(true);
        setModalVisible2(true);
        setCapturedImage(photo);
    };

    const getAddress = async () => {
        if (latitude === 0 || longitude === 0) {
            setIsSearchingLocation(true)
        } else setIsSearchingLocation(false);


        try {
            const address = await Location.reverseGeocodeAsync({ latitude, longitude });
            setCurrentAddress(address[0]);

            const preciseLoc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
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

    const getCurrentAttendance = async () => {
        const conditions = [
            {
                field: "deal_id",
                operator: "==",
                value: selectedDeal?.id
            },
            {
                field: "periode",
                operator: "==",
                value: moment().format("YYYY-MM-DD")
            },
        ];

        const sortBy = null;
        const limitValue = null;
        const startAfterData = null;


        try {
            const result = await getCollectionFirebase(
                'non_management_attendances',
                { conditions },
                { sortBy },
                { limitValue },
                { startAfterData }
            )

            console.log("CURRENT ::::", result)
            if (result?.length > 0) {
                setCurrentAttendance(result[0]);
            } else {
                setCurrentAttendance(null);
            };
        } catch (error) {
            console.log("error getting current attendance", error)
        };
    };

    // const handleAdd = () => {
    //     const object = {
    //         name,
    //         image: capturedImage,
    //         clock_in: moment().format("HH:mm:ss")
    //     };
    //     console.log(object);


    //     const newArr = [...list];

    //     newArr.push(object);

    //     setList([...newArr]);
    //     setCapturedImage(null);
    //     setIsLoading(false);
    //     setPreviewVisible(false);
    //     setModalVisible(false);
    // };

    const handleDelete = item => {
        if (list.length === 1) {
            setList([]);
        } else {
            const updatedArr = list.filter(x => x.name !== item.name);

            setList(updatedArr);
        }
        // if (list?.length > 0) {
        //     const updatedArr = list.splice(index, 1);
        //     setList(updatedArr)
        // } else {
        //     setList([]);
        // };
    };


    const handleOpenCamera = () => {
        if (!selectedDeal) {
            return Alert.alert("Please select deal first!")
        }
        setModalVisible(true);
        setModalVisible2(false);
        setCapturedImage(null);
    };



    useEffect(() => {
        // prepareRatio();
        requestPermission();
        getAddress();
        getOfficeAddresses();
        getDeals();
    }, []);

    useEffect(() => {
        getCurrentAttendance();
        () => {
            setCurrentAttendance(null);
        }
    }, [selectedDeal]);





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
        return <View style={[styles.centeredView, { backgroundColor: Theme.COLORS.PRIMARY }]}>
            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={() => {
                    // Alert.alert('Modal has been closed.');
                    setModalVisible(!modalVisible);
                }}>
                {isLoading && <Block style={{ position: "absolute", zIndex: 2, backgroundColor: "rgba(145, 145, 145, 0.7)" }}
                    height={height} width={width}
                    center middle>
                    <ActivityIndicator size="large" />
                </Block>}
                <View
                    style={{
                        flex: 1,
                    }}
                >

                    {previewVisible && capturedImage ? (
                        <ImageBackground
                            source={{ uri: capturedImage.uri }}
                            style={{
                                flex: 1,
                                displau: 'flex',
                                flexDirection: 'columm',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            {/* <Block style={{
                                // display: 'flex',
                                // height: height * 0.8,
                                // flexDirection: 'column',
                                // justifyContent: 'flex-end',
                                // marginBottom: 200
                                backgroundColor: 'white',
                            }}
                                middle
                                center>
                                <Input
                                    color="black"
                                    placeholder="Description (input names here)"
                                    placeholderTextColor="black"
                                    onChangeText={text => setName(text)}
                                    style={{
                                        height: 300
                                    }}
                                />
                                <Button onPress={handleSubmitAttendances}>
                                    <Text color='white' bold>Submit</Text>
                                </Button>
                                <Button
                                    backgroundColor={theme.COLORS.ERROR}
                                    onPress={() => {
                                        setModalVisible(false);
                                        setCapturedImage(null);
                                        setName("");
                                    }}
                                >
                                    <Text color='white' bold>Remove</Text>
                                </Button>

                            </Block> */}
                            <View style={styles.centeredView}>
                                <Modal
                                    animationType="slide"
                                    transparent={true}
                                    visible={modalVisible2}
                                    onRequestClose={() => {
                                        setModalVisible2(false);
                                    }}>
                                    <View style={styles.centeredView}>
                                        <View style={styles.modalView}>
                                            <Input
                                                color="black"
                                                placeholder="Description (input names here)"
                                                placeholderTextColor="black"
                                                onChangeText={text => setName(text)}
                                                style={{
                                                    height: 300
                                                }}
                                            />
                                            <Button style={{ backgroundColor: theme.COLORS.SUCCESS }} onPress={handleSubmitAttendances}>
                                                <Text color='white' bold>Submit</Text>
                                            </Button>
                                            <Button
                                                style={{ backgroundColor: 'red' }}
                                                onPress={() => {
                                                    setModalVisible(false);
                                                    setCapturedImage(null);
                                                    setName("");
                                                }}
                                            >
                                                <Text color='white' bold>Cancel</Text>
                                            </Button>
                                        </View>
                                    </View>
                                </Modal>
                            </View>
                        </ImageBackground>


                    ) : (
                        isFocused ?
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
                                        width: "100%",
                                        height: 100,
                                        position: 'absolute',
                                        bottom: 0,
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'space-evenly'
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => navigation.goBack()}
                                    >
                                        <Text style={{ fontSize: 20, marginBottom: 10, color: "white" }}>
                                            Back
                                        </Text>
                                    </TouchableOpacity>


                                    <TouchableOpacity
                                        onPress={takePicture}
                                        style={{
                                            width: 70,
                                            height: 70,
                                            bottom: 0,
                                            borderRadius: 50,
                                            backgroundColor: Theme.COLORS.SUCCESS,
                                            justifyContent: "center",
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Text bold color="white">Submit</Text>
                                    </TouchableOpacity>


                                    <TouchableOpacity

                                        onPress={() => {
                                            setType(
                                                type === Camera.Constants.Type.back
                                                    ? Camera.Constants.Type.front
                                                    : Camera.Constants.Type.back
                                            );
                                        }}
                                    >
                                        <Text style={{ fontSize: 20, marginBottom: 10, color: "white" }}>
                                            Flip{" "}
                                        </Text>
                                    </TouchableOpacity>


                                </View>
                            </Camera>
                            :
                            <></>
                    )}
                </View>
            </Modal>
        </View>
    }

    return (
        <SafeAreaView
            style={[
                styles.main,
                { backgroundColor: Theme.COLORS.PRIMARY }
            ]}>
            {isLoading && <Block style={{ position: "absolute", zIndex: 2, backgroundColor: "rgba(145, 145, 145, 0.4)" }}
                height={height} width={width}
                center middle>
                <ActivityIndicator size="large" />
            </Block>}
            <FlatList
                data={[]}
                renderItem={<></>}
                keyExtractor={item => item.id}
                ListHeaderComponent={
                    <Block
                        // id="container"
                        backgroundColor={Theme.COLORS.PRIMARY}
                        height={height}
                        style={styles.main}
                    >
                        {/* {isSearchingLocation ?
                            <Image
                                source={require("../../../../assets/searching_for_location.gif")}
                                style={styles.map}
                            />

                            :

                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: latitude || -6.186206,
                                    longitude: longitude || 106.708982,
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
                            >


                                <Marker
                                    coordinate={{ latitude: preciseLocation.latitude, longitude: preciseLocation.longitude }}
                                    title={currentAddress ? currentAddress?.name : "My Location"}
                                >
                                    <Block>
                                        <Image source={require("../../../../assets/person-location.png")} style={styles.pin} />
                                    </Block>
                                </Marker>
                                {selectedOffice && <Marker
                                    coordinate={{ latitude: selectedOffice?.latitude, longitude: selectedOffice?.longitude }}
                                    title={selectedOffice ? selectedOffice?.name : "My Office"}
                                />}

                            </MapView>
                            } */}

                        <Block center middle>
                            <Text bold color='white'>
                                Select Deals:
                            </Text>
                            <SelectDropdown
                                data={dealsList}
                                buttonStyle={{
                                    width: width * 0.95,
                                    marginTop: 10
                                }}
                                defaultButtonText={selectedDeal ? selectedDeal?.title : "Please select Deals!"}
                                onSelect={(selectedItem, index) => {
                                    setSelectedDeal(selectedItem)
                                }}
                                buttonTextAfterSelection={(selectedItem, index) => {
                                    // text represented after item is selected
                                    // if data array is an array of objects then return selectedItem.property to render after item is selected
                                    return selectedItem?.title
                                }}
                                rowTextForSelection={(item, index) => {
                                    // text represented for each item in dropdown
                                    // if data array is an array of objects then return item.property to represent item in dropdown
                                    return item?.title
                                }}

                                search
                                searchPlaceHolder={'Search deals here'}
                                searchPlaceHolderColor={'darkgrey'}
                                renderSearchInputLeftIcon={() => {
                                    return <FontAwesome name={'search'} color={'#444'} size={18} />;
                                }}
                            />
                            <Text marginTop={10} bold color='white' size={20}>
                                {moment().format("ddd, DD MMM YYYY")}
                            </Text>
                            {/* <Block flex row>
                            <Button onPress={() => navigation.goBack()} style={{ backgroundColor: Theme.COLORS.ERROR, display: 'flex', flexDirection: 'row' }}>
                                <Ionicons name="arrow-back" size={24} color="white" />
    
                                <Text color="white" bold>Back</Text>
                            </Button>
                            <Button onPress={() => navigation.navigate("")} style={{ backgroundColor: Theme.COLORS.WARNING, padding: 10 }}>
                                <Block flex row style={{ justifyContent: 'center', alignItems: 'center' }}>
                                    <MaterialIcons name="construction" size={24} color="white" />
                                    <Block flex column >
                                        <Text style={{ textAlign: 'center', fontSize: 10 }} color="white" bold>Non-management</Text>
                                        <Text style={{ textAlign: 'center', fontSize: 10 }} color="white" bold>Attendance</Text>
                                    </Block>
                                </Block>
                            </Button>
                        </Block> */}

                            {list?.length !== 0 &&
                                <Block column style={{ backgroundColor: 'white', padding: 10, marginTop: 10, width }}>
                                    <Block row>
                                        <FlatList
                                            data={list}
                                            horizontal={true}
                                            showsHorizontalScrollIndicator={false}
                                            showsVerticalScrollIndicator={false}
                                            keyExtractor={(item, index) => `${index}-${item.title}`}
                                            renderItem={({ item, index }) => (
                                                <Block
                                                    width={100}
                                                    height={100}
                                                    backgroundColor="white"
                                                    center
                                                >
                                                    <TouchableOpacity
                                                        onPress={() => handleDelete(item)}
                                                        style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            right: 0,
                                                            zIndex: 10,
                                                        }}>
                                                        <Entypo
                                                            name="circle-with-cross"
                                                            size={30}
                                                            color="red" />
                                                    </TouchableOpacity>
                                                    <Image
                                                        style={{
                                                            width: 80,
                                                            height: 80,
                                                            borderRadius: 50
                                                        }}
                                                        source={{
                                                            uri: item?.image?.uri
                                                        }}
                                                    />
                                                    <Text bold>{item.name}</Text>
                                                </Block>
                                            )}
                                        />
                                    </Block>
                                </Block>
                            }


                            <Block
                                flex
                                row
                                style={{
                                    flexWrap: "wrap",
                                    justifyContent: 'space-evenly',
                                    paddingHorizontal: width * 0.04
                                }}>
                                {/* <Button
                                    onPress={() => navigation.navigate("LiveAttendanceStack")}
                                    style={{
                                        backgroundColor: Theme.COLORS.ERROR,
                                        display: 'flex',
                                        flexDirection: 'row',
                                    }}>
                                    <Ionicons name="arrow-back" size={24} color="white" />
                                    <Text color="white" bold>Back</Text>
                                </Button>

                                <Button
                                    onPress={() => {
                                        setModalVisible(true);
                                    }}
                                    style={{
                                        backgroundColor: Theme.COLORS.WARNING,
                                        padding: 10
                                    }}
                                >
                                    <Block flex row style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <AntDesign name="camera" size={24} color="white" />
                                        <Block flex column >
                                            <Text style={{ textAlign: 'center', fontSize: 10 }} color="white" bold>
                                                Open Camera
                                            </Text>
                                        </Block>
                                    </Block>
                                </Button> */}
                                <Block
                                    style={{
                                        margin: width * 0.06,
                                        backgroundColor: 'white',
                                        height: "auto",
                                        width: "100%",
                                        borderRadius: 10,
                                        padding: 20,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        display: 'flex'
                                    }}
                                >
                                    {!currentAttendance ?
                                        <>
                                            <Image
                                                style={{
                                                    width: 250,
                                                    height: 250,
                                                }}
                                                // source={require("../../../../assets/images/select-date.png")}
                                                source={require("../../../../assets/images/select-date.png")}
                                            />
                                            <Text bold size={18} textAlign='center'>
                                                There is no data, please submit worker's attendance!
                                            </Text>
                                            <Button
                                                onPress={() => handleOpenCamera()}
                                                style={{
                                                    width: '100%',
                                                    backgroundColor: Theme.COLORS.SUCCESS,
                                                    padding: 10
                                                }}
                                            >
                                                <Block flex row style={{ justifyContent: 'center', alignItems: 'center' }}>
                                                    <AntDesign name="camera" size={24} color="white" />
                                                    <Block flex column >
                                                        <Text style={{ textAlign: 'center' }} color="white" bold>
                                                            Open Camera
                                                        </Text>
                                                    </Block>
                                                </Block>
                                            </Button>
                                        </>
                                        :
                                        <>
                                            <Image
                                                style={{
                                                    width: 250,
                                                    height: undefined,
                                                    aspectRatio: 9 / 16
                                                }}
                                                source={{ uri: currentAttendance?.image_url }}
                                            />
                                            <Text color="gray">Details: </Text>
                                            <Text>
                                                {currentAttendance?.details}
                                            </Text>
                                        </>
                                    }
                                </Block>







                            </Block>




                        </Block>

                    </Block>
                }
            />



        </SafeAreaView >
    )
}

const styles = StyleSheet.create({
    main: {
        paddingTop: height * 0.04
    },
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
        // paddingTop : StatusBar.currentHeight,
        display: 'flex',
        flexDir: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: height,
        zIndex: 2
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
        // marginTop: height * 0.1,
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