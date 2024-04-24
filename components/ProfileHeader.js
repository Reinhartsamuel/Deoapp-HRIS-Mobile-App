import { View, StyleSheet, Dimensions, Platform, Modal, TouchableOpacity, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Block, Button, Text, theme } from 'galio-framework'
import { auth } from '../configs/firebase';
import { iPhoneNotch } from '../constants/utils';
import { Images } from '../constants';
import useAuthStore from '../store/user';
import SelectDropdown from 'react-native-select-dropdown';
import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { storeDataObject } from '../services/asyncStorage';
import { getCollectionFirebase } from '../apis/firebaseApi';

const { width, height } = Dimensions.get("screen");

const ProfileHeader = () => {
    const { userData, setUserData } = useAuthStore();
    const [modalVisible, setModalVisible] = useState(false);
    // console.log(auth.currentUser.stsTokenManager.accessToken)

    const handlePreviewImage = () => {
        setModalVisible(true);
        console.log(userData)
    };

    // console.log(auth.currentUser.stsTokenManager.accessToken)
    const getProjects = async () => {
        let resultProjects;
        const conditionProjects = [
            {
                field: 'companyId',
                operator: '==',
                value: userData.current_company_id || userData.companies[0].id
            },
            {
                field: 'users',
                operator: 'array-contains',
                value: auth.currentUser.uid
            },
        ];
        try {
            const sortBy = null;
            const limitValue = null;
            const startAfterData = null;
            resultProjects = await getCollectionFirebase('projects',
                { conditions: conditionProjects },
                { sortBy },
                { limitValue },
                { startAfterData });

            // console.log("resultProjects::::", resultProjects);
            const x = {
                ...userData,
                projects: resultProjects,
                currentProject: resultProjects[0]?.id,
                current_project_name: resultProjects[0]?.name,
            };

            setUserData({ ...x });
        } catch (error) {
            Alert.alert(error.message);
            console.log("error getting projects PROFILE HEADER:", error);
        };
    };


    useEffect(() => {
        getProjects();
    }, [userData.current_company_id])

    return (
        <>
            <Block style={styles.Block1}>
                {/* <Text
                    style={{
                        fontSize: 12,
                        color: "white",
                    }}
                    allowFontScaling={false}
                >
                    {userData?.current_company_name && userData?.current_company_name ? userData?.current_company_name : ""}
                </Text> */}
            </Block>

            <Block height={height * 0.09} row style={styles.Block2}>
                <Block column>
                    <Pressable onPress={() => console.log(userData)}>
                        <Text
                            style={{
                                fontSize: 20,
                                fontWeight: "bold",
                                color: "white",
                                marginBottom: 4,
                            }}
                            allowFontScaling={false}
                        >
                            {userData?.name ? userData?.name : auth.currentUser?.displayName}
                        </Text>
                    </Pressable>
                    {/* <Text
                        style={{
                            fontSize: 14,
                            fontWeight: "500",
                            color: "white",
                        }}
                        allowFontScaling={false}
                    >
                        {userData ? userData?.employeeAttribute?.status : "General Manager"}
                    </Text> */}

                    <Block >
                        <SelectDropdown
                            data={userData.companies}
                            buttonStyle={{
                                width: 150,
                                height: 20,
                                borderRadius: 10,
                                marginTop: 10,
                                backgroundColor: "rgba(255,255,255,0.2)",
                            }}
                            buttonTextStyle={{
                                fontSize: 12,
                                color: 'white'
                            }}

                            defaultButtonText={userData.current_company_name || "Select company"}
                            onSelect={(selectedItem, index) => {
                                const x = {
                                    ...userData,
                                    project: selectedItem,
                                    current_company_name: selectedItem.name,
                                    current_company_id: selectedItem.id,
                                }
                                setUserData({ ...x });
                                storeDataObject('userData', { ...x });
                            }}
                            buttonTextAfterSelection={(selectedItem, index) => {
                                return selectedItem?.name
                            }}
                            rowTextForSelection={(item, index) => {
                                return item?.name
                            }}
                        // search
                        // searchPlaceHolder={"Search companies"}
                        // searchPlaceHolderColor={'darkgrey'}
                        // renderSearchInputLeftIcon={() => {
                        //     return <FontAwesome name={'search'} color={'#444'} size={18} />;
                        // }}
                        />
                    </Block>
                    <Block marginBottom={10}>
                        <SelectDropdown
                            data={userData.projects}
                            buttonStyle={{
                                width: 150,
                                height: 20,
                                borderRadius: 10,
                                marginTop: 10,
                                backgroundColor: "rgba(255,255,255,0.2)",
                            }}
                            buttonTextStyle={{
                                fontSize: 12,
                                color: 'white'
                            }}

                            defaultButtonText={userData.current_project_name || "Select project"}
                            onSelect={(selectedItem, index) => {
                                const x = {
                                    ...userData,
                                    project: selectedItem,
                                    currentProject: selectedItem.id,
                                    currentProjectName: selectedItem.name
                                }
                                setUserData({ ...x });
                                storeDataObject('userData', { ...x });
                            }}
                            buttonTextAfterSelection={(selectedItem, index) => {
                                return selectedItem?.name
                            }}
                            rowTextForSelection={(item, index) => {
                                return item?.name
                            }}
                        // search
                        // searchPlaceHolder={"Search companies"}
                        // searchPlaceHolderColor={'darkgrey'}
                        // renderSearchInputLeftIcon={() => {
                        //     return <FontAwesome name={'search'} color={'#444'} size={18} />;
                        // }}
                        />
                    </Block>
                </Block>

                <Block style={styles.avatarBlock}>
                    <TouchableOpacity onPress={handlePreviewImage}>
                        <Image
                            source={{
                                uri: userData?.image ?
                                    userData?.image : auth.currentUser?.photoURL,
                            }}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                </Block>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(false);
                    }}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Image
                                source={{
                                    uri: userData?.image ?
                                        userData?.image : Images.dummyAvatar,
                                }}
                                style={styles.previewImage}
                            />
                        </View>
                        <Button onPress={() => setModalVisible(false)}>
                            <Text bold color="white">Close</Text>
                        </Button>
                    </View>
                </Modal>
            </Block>
        </>

    )
}

export default ProfileHeader


const styles = StyleSheet.create({
    Block1: {
        marginHorizontal: 20,
        marginTop:
            Platform.OS === "android"
                ? height * 0.03
                : Platform.OS === "ios" && !iPhoneNotch
                    ? height * 0.04
                    : height * 0.07,
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
    avatarBlock: {
        paddingTop:
            Platform.OS === "android"
                ? height * 0.02
                : Platform.OS === "ios" && !iPhoneNotch
                    ? height * 0.025
                    : height * 0.02,
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "black"
    },
    previewImage: {
        height: width,
        width: width
    },
    modalView: {
        // margin: 20,
        backgroundColor: 'black',
        borderRadius: 20,
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
})