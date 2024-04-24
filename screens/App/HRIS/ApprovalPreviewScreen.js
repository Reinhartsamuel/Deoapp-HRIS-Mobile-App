import { Dimensions, Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'



const { width } = Dimensions.get("window");

const ApprovalPreviewScreen = ({ route }) => {
    const { item } = route.params?.data;
    console.log("params", route.params?.data?.item);
    return (
        <View>
            <Text>ApprovalPreviewScreen</Text>
            <Text>Image : {item?.LeaveRequest?.file}</Text>
            <Image
                source={{ uri: item?.LeaveRequest?.file }}
                style={{ width: width * 0.5, height: width }}
            />
           
        </View>
    )
}

export default ApprovalPreviewScreen

const styles = StyleSheet.create({

})