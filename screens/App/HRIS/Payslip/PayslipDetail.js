import { Dimensions, FlatList, ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { Fragment, useEffect, useState } from 'react'
import { Block, theme, Text } from 'galio-framework';
import { auth } from '../../../../configs/firebase';
import axios from 'axios';
import moment from 'moment';
import { iPhoneNotch } from '../../../../constants/utils';

const { width, height } = Dimensions.get("screen");

const payslipItems = [
    {
        name: "Adjustments",
        tag: "adjustments"
    },
    {
        name: "Deductions",
        tag: "deductions"
    },
];

const PayslipDetailScreen = ({ route }) => {
    const data = route.params?.item;
    const [details, setDetails] = useState({});


    const getDetail = async () => {
        const config = {
            method: 'get',
            // url: `https://asia-southeast2-lifetime-design-erp.cloudfunctions.net/production/hris/payroll/${data.id}`,
            url: `https://asia-southeast2-lifetime-design-erp.cloudfunctions.net/production/hris/payroll/27`,
            headers: {
                'Authorization': `Bearer ${auth.currentUser.stsTokenManager.accessToken}`,
            }
        };

        try {
            const result = await axios(config);

            // console.log("result.data:::", result.data);
            if (result.status === 200) {
                const x = result.data;
                const deductions = x?.items.filter(y => y.flag === "deduction");
                const adjustments = x?.items.filter(y => y.flag === "addjusment");

                const updatedDetail = {
                    deductions,
                    adjustments,
                    createdAt: x.createdAt,
                    approved_at: x.approved_at,
                    periode: x.periode,
                    total: x.total,
                    user: x.user,
                };
                console.log("updatedDetail", updatedDetail)
                console.log("user:", Object.keys(updatedDetail))
                setDetails(updatedDetail);
            };
        } catch (error) {
            console.log("error getting payslip detail::", error.message);
            throw error;
        };
    };


    useEffect(() => {
        getDetail();
    }, []);

    return (
        <Fragment>
            <ImageBackground
                source={require("../../../../assets/images/imagesvg.png")}
                style={styles.logCorrection}
            >
                <Block flex style={styles.section1}>
                    <TouchableOpacity
                        style={{ marginTop: 12 }}
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
                                style={{
                                    height: 120,
                                    justifyContent: "center",
                                }}>
                                <Text color="white" size={20} bold>
                                    {data?.name} 
                                </Text>
                                <Block row>
                                    <Text color={theme.COLORS.GREY} size={15}>
                                    {details?.user?.name}
                                    </Text>
                                    <Text color={theme.COLORS.GREY} size={15}>
                                        {" -"}{details?.user?.email}
                                    </Text>
                                </Block>

                                <Text color={theme.COLORS.GREY} size={15}>
                                 {details?.periode?.split(" ")[0]}({data?.flag})
                                    </Text>

                            </Block>
                        </Block>
                    </TouchableOpacity>
                </Block>


                <Block flex style={styles.section2}>
                    <FlatList
                        ListHeaderComponent={
                            <>
                                <Block
                                    style={{
                                        width: "100%",
                                        backgroundColor: theme.COLORS.MUTED,
                                        padding: 10,
                                        height: 50,
                                        marginVertical: 2
                                    }}>
                                    <Text bold color={theme.COLORS.GREY}>
                                        Total Income
                                    </Text>
                                </Block>
                                <Block style={styles.itemList}>
                                    <Text>Total</Text>
                                    <Text>{details?.total}</Text>
                                </Block>
                                <Block style={styles.itemList}>
                                    <Text>Created At</Text>
                                    <Text>{moment(details?.createdAt).format('llll')}</Text>
                                </Block>
                            </>}
                        data={payslipItems}
                        horizontal={false}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => `${index}-${item.title}`}
                        renderItem={({ item, index }) => (
                            <>
                                <Block
                                    style={{
                                        width: "100%",
                                        backgroundColor: theme.COLORS.MUTED,
                                        padding: 10,
                                        height: 50,
                                        marginVertical: 2,
                                        marginTop: 10
                                    }}>
                                    <Text bold color={theme.COLORS.GREY}>
                                        {item.name}
                                    </Text>
                                </Block>
                                <FlatList
                                    data={item.tag === "deductions" ? details.deductions : details.adjustments}
                                    horizontal={false}
                                    showsHorizontalScrollIndicator={false}
                                    showsVerticalScrollIndicator={false}
                                    keyExtractor={(item, inditem) => `${index}-${item.label}`}
                                    renderItem={({ item, index }) => (
                                        <Block style={styles.itemList}>
                                            <Text>{item?.label}</Text>
                                            <Text>IDR {item?.amount}</Text>
                                        </Block>
                                    )}
                                />
                            </>
                        )}
                    />
                </Block>
            </ImageBackground>
        </Fragment>
    );
}

export default PayslipDetailScreen;

const styles = StyleSheet.create({
    logCorrection: {
        flex: 1,
        // backgroundColor: "#ffffff",
    },
    section1: {
        marginTop:
            Platform.OS === "android"
                ? height * 0.04
                : Platform.OS === "ios" && !iPhoneNotch
                    ? height * 0.04
                    : height * 0.03,
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
    itemList: {
        width: "100%",
        padding: 10,
        marginVertical: 2,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    }   
});
