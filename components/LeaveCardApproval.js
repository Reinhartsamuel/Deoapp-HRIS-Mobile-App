import { StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import React from 'react'
import { Block, Button, Text, theme } from 'galio-framework';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';


const { width } = Dimensions.get("window");

export default function LeaveCardApproval(props) {
    const { item, getOneLeaveCategory, handleModal, setSelectedImage, navigation, leaveCategories } = props;

    const renderLeaveType = () => {
        return leaveCategories?.length > 0 &&
            leaveCategories.find(x => x.id === item?.leave_request_category_id)?.name !== undefined ?
            (leaveCategories.find(x => x.id === item?.leave_request_category_id)?.name || item?.leave_request_category_id) :
            item?.leave_request_category_id;
    };

    return (

        <Block flex card style={[styles.category,
             styles.shadow
        ]}>
            <Block flex fluid backgroundColor={theme.COLORS.DRIBBBLE} padding={10} height={40}>
                <Text bold color="white">
                    {/* {`${item?.LeaveRequest?.start_date}-${item?.LeaveRequest?.end_date}`} */}
                    {moment(item?.start_date, "YYYY-MM-DD").format("D MMM YY")}
                    {" - "}
                    {moment(item?.end_date, "YYYY-MM-DD").format("D MMM YY")}
                </Text>

            </Block>
            {/* <Block row justifyContent="space-between">
                <Block column style={styles.categoryTitle}>
                    <Text size={12} bold color={theme.COLORS.BLACK}>
                        Requester
                    </Text>
                    <Text size={12} bold color="gray">
                        Division
                    </Text>
                </Block>

                <Block column style={styles.categoryTitle}>
                    <Text bold size={12} color={theme.COLORS.BLACK}>
                        {item?.LeaveRequest?.userReq?.name}
                    </Text>
                    <Text size={12} color="gray">
                        {item?.LeaveRequest?.userReq?.title}
                    </Text>
                </Block>
            </Block> */}



            <Block row justifyContent="space-between">
                <Block column style={styles.categoryTitle}>
                    <Text size={12} bold color={theme.COLORS.BLACK}>
                        Requested
                    </Text>
                </Block>

                <Block column style={styles.categoryTitle}>
                    <Text size={12} color={theme.COLORS.BLACK}>
                        {moment(item?.createdAt).format(
                            "YYYY-MM-DD HH:MM:ss"
                        )}
                    </Text>
                </Block>
            </Block>
            <Block row justifyContent="space-between">
                <Block column style={styles.categoryTitle}>
                    <Text size={12} bold color={theme.COLORS.BLACK}>
                        Leave Type
                    </Text>
                </Block>

                <Block column style={styles.categoryTitle}>
                    <Text size={12} color={theme.COLORS.BLACK}>
                        {/* {item.leave_request_category_id} */}
                        {renderLeaveType()}
                    </Text>
                </Block>
            </Block>
            <Block row justifyContent="space-between">
                <Block column style={styles.categoryTitle}>
                    <Text size={12} bold color={theme.COLORS.BLACK}>
                        Status
                    </Text>
                </Block>
                <Block row style={styles.status}>
                    <Ionicons
                        name={
                            item?.current_status === "APPROVE HR" ?
                                "checkmark-circle" : item?.current_status === "waiting"
                                    ? "alarm-outline" :
                                    item?.current_status?.includes("REJECT") ?
                                        "close" : "time"
                        }
                        size={24}
                        color={
                            item?.current_status === "APPROVE HR" ?
                                "green" : item?.current_status === "waiting"
                                    ? theme.COLORS.WARNING :
                                    item?.current_status?.includes("REJECT") ?
                                        "red" : "orange"
                        }
                    />
                    <Text
                        bold
                        size={12}
                        color={
                            item?.current_status === "APPROVE HR" ?
                                "green" : item?.current_status === "requested"
                                    ? theme.COLORS.WARNING :
                                    item?.current_status?.includes("REJECT") ?
                                        "red" : theme.COLORS.BLACK
                        }
                    >
                        {item?.current_status || "requested"}
                    </Text>
                </Block>
            </Block>

            <Block row justifyContent="space-between">
                <Block column style={styles.categoryTitle}>
                    <Text size={12} bold color={theme.COLORS.BLACK}>
                        Attachment
                    </Text>
                </Block>

                <Block column style={styles.categoryTitle}>
                    <TouchableOpacity style={{ padding: 3 }} onPress={() => {
                        handleModal(item)
                        setSelectedImage(item?.attachments)
                        console.log(item?.attachments)
                        // navigation.navigate("ApprovalPreview", {
                        //     data: {
                        //         item
                        //     }
                        // })
                    }}>
                        <Text color="blue">See attachment</Text>
                    </TouchableOpacity>
                </Block>
            </Block>

            {/* <Block flex row justifyContent="flex-end">
                <Button
                    color="red"
                    onPress={() => handleModal(item)}
                    style={styles.frontButton}
                >
                    Reject
                </Button>
                <Button
                    color="green"
                    onPress={() => handleModal(item)}
                    style={styles.frontButton}
                >
                    Approve
                </Button>
            </Block> */}
            {/* <Text>{JSON.stringify(item)}</Text>F */}
        </Block>
    );
};


const styles = StyleSheet.create({
    category: {
        backgroundColor: theme.COLORS.WHITE,
        marginVertical: theme.SIZES.BASE / 2,
        borderWidth: 0,
        width: width * 0.8,
        // height: height * 0.25,
        justifyContent: "space-betweena",
        // borderTopLeftRadius: 40,
        borderToprightRadius: 40,
        overflow: "hidden"
    },
    shadow: {
        shadowColor: theme.COLORS.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
        shadowOpacity: 0.1,
        elevation: 2,
    },
    categoryTitle: {
        // height: "100%",
        paddingHorizontal: theme.SIZES.BASE,
        paddingVertical: 8,
        // backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
    },
    status: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.SIZES.BASE,
    },
    approveBtn: {
        padding: 8,
        margin: 4,
        borderRadius: 5,
        backgroundColor: "00000000",
    },
    frontButton: {
        size: 2,
        width: 100,
        height: 20,
        opacity: 0.6
    }
})