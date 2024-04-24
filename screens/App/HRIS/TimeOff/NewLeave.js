import { Block, Text, theme, Button, Input } from "galio-framework";
import React, { Fragment, useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Dimensions,
	Image,
	ImageBackground,
	Modal,
	Platform,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";

import { auth } from "../../../../configs/firebase";
import { iPhoneNotch } from "../../../../constants/utils";
import SelectDropdown from "react-native-select-dropdown";
// import DatePicker from "@dietime/react-native-date-picker";
import axios from "axios";
import moment from "moment-timezone";
// import RNDateTimePicker from "@react-native-community/datetimepicker";
import { TextInput } from "react-native-gesture-handler";
import * as ImagePicker from 'expo-image-picker';
import { UploadWithBytes } from "../../../../services/imageUpload";
import { insertPixelsToLink } from "../../../../services/utils";
import useAuthStore from "../../../../store/user";

const { height, width } = Dimensions.get("window");
const dates = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
const months = [{ name: "January", value: 1 }, { name: "February", value: 2 }, { name: "March", value: 3 }, { name: "April", value: 4 }, { name: "May", value: 5 }, { name: "June", value: 6 }, { name: "July", value: 7 }, { name: "August", value: 8 }, { name: "September", value: 9 }, { name: "October", value: 10 }, { name: "November", value: 11 }, { name: "December", value: 12 }];
const years = [2017, 2018, 2019, 2020, 2021, 2022, 2023];

function NewLeave({ navigation }) {
	// ** State
	const currentYear = moment().format("YY");
	const currentMonth = moment().format("MM");
	const currentDay = moment().format("DD");

	const [date, setDate] = useState(new Date());
	const [mode, setMode] = useState("date");
	const [show, setShow] = useState(false);
	const [image, setImage] = useState(null);
	const [blob, setBlob] = useState(null);
	const [showStartDateIos, setShowStartDateIos] = useState(true);
	const [showEndDateIos, setShowEndDateIos] = useState(true);
	const [leaveCategories, setLeaveCategories] = useState([]);
	const [showDateAndroid, setShowDateAndroid] = useState({
		start_date: false,
		end_date: false
	});
	const [showDatePicker, setShowDatePicker] = useState(false);


	// const [permissionResponse, requestPermissionMedia] = MediaLibrary.usePermissions();
	const [cameraPermission, requestPermissionImagePickerCamera] = ImagePicker.useCameraPermissions();
	const [libraryPermission, requestPermissionLibrary] = ImagePicker.useMediaLibraryPermissions();
	const [selectedDate, setSelectedDate] = useState(date);
	const [selectedMonth, setSelectedMonth] = useState(parseInt(moment().format("M")));
	const [selectedYear, setSelectedYear] = useState(moment().format("YYYY"));
	const [selectedDay, setSelectedDay] = useState(currentDay);
	const [isLoading, setIsLoading] = useState(false);
	const [leaveData, setLeaveData] = useState({
		user_id: "",
		leave_category_id: 0,
		start_date: moment().format(),
		end_date: moment().add(parseInt(this.start_date) - 1, "days"),
		balance: 1,
	});
	const [currentProject, setCurrentProject] = useState("");

	const token = auth?.currentUser?.stsTokenManager?.accessToken;
	const { userData } = useAuthStore();

	const handleSubmit = async () => {
		setIsLoading(true);
		let imageUrl;
		const type = `attendances/${auth.currentUser.uid
			}/leave/${moment().format("MMMM-YYYY")}`;

		try {
			const attachmentImage = await UploadWithBytes(
				`correction-req-${auth.currentUser?.uid}-${moment().format("DD-MM-YYYY")}`,
				type,
				blob
			);
			imageUrl = attachmentImage.url;
		} catch (error) {
			console.log("error when uploading attachment", error);
		};

		const submitData = {
			leave_request_category_id: leaveData?.leave_category_id || 1,
			start_date: moment(leaveData.start_date).format("YYYY-MM-DD"),
			end_date: moment(leaveData.end_date).format("YYYY-MM-DD"),
			attachments: [insertPixelsToLink(imageUrl)]
		};

		console.log("submitData", submitData);
		// return setIsLoading(false);
		// console.log("leaveCategories", leaveCategories);
		const token = auth?.currentUser?.stsTokenManager?.accessToken;

		const config = {
			method: 'post',
			url: 'https://asia-southeast2-deoapp-indonesia.cloudfunctions.net/hris/api/leave-request',
			data: submitData,
			headers: {
				'Authorization': `Bearer ${token}`,
				'project': userData.currentProject || currentProject,
				'company': userData.currentCompany
			}
		};
		console.log("config", config)
		try {
			const result = await axios(config);
			console.log("result SUBMIT NEW LEAVE::", result?.data);
			if (result?.data?.status) {
				console.log(result.data, ":::request leave submission");
				Alert.alert("Your request has been submitted 🙏🙏🙏");
				navigation.goBack();
			} else {
				Alert.alert(result?.data?.message);
			};
		} catch (error) {
			Alert.alert(`Error : ${error.message}`);
			console.log("error when submitting timeoff", error);
			throw new error;
		} finally {
			setIsLoading(false);
		};
	};

	const handleCloseModal = () => {
		setShowDatePicker(!showDatePicker);
		setLeaveData({
			...leaveData,
			start_date: moment(`${selectedDay}-${selectedMonth}-${selectedYear}`, "D-M-YYYY").tz('Asia/Jakarta').format()
		});
		// console.log({
		// 	...leaveData,
		// 	start_date: moment(`${selectedDay}-${selectedMonth}-${selectedYear}`, "D-M-YYYY").tz('Asia/Jakarta').format()
		// })
	};

	const renderDate = () => {
		switch (selectedMonth) {
			case 1:
			case 3:
			case 5:
			case 7:
			case 8:
			case 10:
			case 12:
				return [...dates, 31];
			default:
				return dates;
		};
	};

	const renderStartDate = () => {
		if (selectedDate || selectedMonth || selectedYear) {
			return moment(`${selectedDate}-${selectedMonth}-${selectedYear}`, "D-M-YYYY").format('D MMM YYYY');
		} else return
	};

	const pickImage = async () => {
		requestPermissionLibrary();
		requestPermissionImagePickerCamera();
		// No permissions request is necessary for launching the image library
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.All,
			allowsEditing: true,
			// aspect: [4, 3],
			quality: 0.1,
		});

		try {
			if (!result.canceled) {
				setImage(result.assets[0]);
				// console.log(result.assets[0]);
				const blobData = await new Promise((resolve, reject) => {
					const xhr = new XMLHttpRequest();
					xhr.onload = function () {
						resolve(xhr.response);
					};
					xhr.onerror = function (e) {
						console.log("error xhr", e)
						reject(new TypeError("Network request failed"));
					};
					xhr.responseType = "blob";
					xhr.open("GET", result.assets[0].uri, true);
					xhr.send(null);
				});
				setBlob(blobData);
			};
		} catch (error) {
			Alert.alert("An error happpened when selecting attachment!")
		};
	};

	const getLeaveCategory = async () => {
		const config = {
			url: "https://asia-southeast2-deoapp-indonesia.cloudfunctions.net/hris/api/leave-request-category",
			method: "get",
			headers: {
				'project': 1,
				'Authorization': `Bearer ${token}`
			}
		};

		try {
			const result = await axios(config);
			console.log("result getting leave categories:", result.data)
			setLeaveCategories(result?.data?.data);
		} catch (error) {
			console.log("error getting categories", error);
			throw error;
		}
	};

	useEffect(() => {
		getLeaveCategory();
		return () => setImage(null);
	}, []);

	return (
		<Fragment>
			{isLoading && <Block style={{ position: "absolute", zIndex: 2, backgroundColor: "rgba(145, 145, 145, 0.5)" }}
				height={height} width={width}
				center middle>
				<ActivityIndicator size="large" />
			</Block>}
			<ImageBackground
				source={require("../../../../assets/images/imagesvg.png")}
				imageStyle={{
					opacity: 0.7,
				}}
				style={styles.main}
			>
				{/* {Platform.OS === "android" && */}
				{true &&
					// <TouchableOpacity
					// 	style={[
					// 		{
					// 			marginTop: 100,
					// 		},
					// 	]}
					// 	onPress={() => showMode("date")}
					// >
					// 	<Block
					// 		row
					// 		center
					// 		style={{
					// 			justifyContent: "space-evenly",
					// 			alignItems: "center",
					// 			alignContent: "center",
					// 			width: "90%",
					// 		}}
					// 	>
					// 		<Block
					// 			center
					// 			style={[
					// 				{
					// 					height: 120,
					// 					width: "28%",
					// 					justifyContent: "center",
					// 				},
					// 				styles.glassTime,
					// 			]}
					// 		>
					// 			<Text color="white" size={32} bold>
					// 				{currentDay}
					// 			</Text>
					// 			<Text color="white" size={12} bold>
					// 				{moment(currentDay, "DD").format("dddd")}
					// 			</Text>
					// 		</Block>

					// 		<Block
					// 			center
					// 			style={[
					// 				{
					// 					height: 120,
					// 					width: "28%",
					// 					justifyContent: "center",
					// 				},
					// 				styles.glassTime,
					// 			]}
					// 		>
					// 			<Text color="white" size={32} bold>
					// 				{currentMonth}
					// 			</Text>

					// 			<Text color="white" size={12} bold>
					// 				{moment(currentMonth, "MM").format("MMMM")}
					// 			</Text>
					// 		</Block>

					// 		<Block
					// 			center
					// 			style={[
					// 				{
					// 					height: 120,
					// 					width: "28%",
					// 					justifyContent: "center",
					// 				},
					// 				styles.glassTime,
					// 			]}
					// 		>
					// 			<Text color="white" size={32} bold>
					// 				{currentYear}
					// 			</Text>
					// 			<Text color="white" size={12} bold>
					// 				{moment(currentYear, "YY").format("yyyy")}
					// 			</Text>
					// 		</Block>
					// 	</Block>
					// </TouchableOpacity>


					// <Block
					// 	center
					// 	style={[
					// 		{
					// 			height: 120,
					// 			width: "28%",
					// 			justifyContent: "center",
					// 		},
					// 		styles.glassTime,
					// 	]}
					// >
					// 	<Text color="white" size={32} bold>
					// 		{(selectedDate && moment(selectedDate).format("MM")) || currentMonth}
					// 	</Text>

					// 	<Text color="white" size={12} bold>
					// 		{(selectedDate && moment(selectedDate).format("MMMM")) || moment(currentMonth, "MM").format("MMMM")}
					// 	</Text>
					// </Block>


					// <Block marginTop={90} row center>
					// 	<Block
					// 		center
					// 		style={[
					// 			{
					// 				height: 60,
					// 				margin: 10,
					// 				width: "28%",
					// 				justifyContent: "center",

					// 			},
					// 			styles.glassBox,
					// 		]}
					// 	>
					// 		<Text bold size={12} color="#555555">Start Date</Text>
					// 		<TouchableOpacity onPress={() => setShowDateAndroid({ ...showDateAndroid, start_date: true })}>
					// 			<Text bold>
					// 				{leaveData.start_date ? moment(leaveData.start_date).format('D MMM YYYY') : moment(selectedDate).format('D MMM YYYY')}
					// 			</Text>
					// 		</TouchableOpacity>
					// 	</Block>
					// 	<Block
					// 		center
					// 		style={[
					// 			{
					// 				height: 60,
					// 				margin: 10,
					// 				width: "28%",
					// 				justifyContent: "center",
					// 			},
					// 			styles.glassBox,
					// 		]}
					// 	>
					// 		<Text bold size={12} color="#555555">Start Date</Text>
					// 		<TouchableOpacity onPress={() => setShowDateAndroid({ ...showDateAndroid, end_date: true })}>
					// 			<Text bold>{leaveData.end_date ? moment(leaveData.end_date).format('D MMM YYYY') : moment(selectedDate).format('D MMM YYYY')}</Text>
					// 		</TouchableOpacity>
					// 	</Block>
					// 	<Button onPress={() => console.log(leaveData)}>Check</Button>
					// </Block>



					<Block style={[{ marginTop: 100, padding: 20 }, styles.glassBox]} center>
						<Block marginTop={5} row>
							<TouchableOpacity
								style={{ display: "flex", flexDirection: "row" }}
								onPress={() => setShowDatePicker(true)}
							>
								<Text bold>Select Start Date</Text>
								<Text style={{ marginHorizontal: 8 }}>
									{leaveData?.start_date ? moment(leaveData?.start_date).format('D MMM YYYY')
										: moment().format('D MMM YYYY')}
								</Text>
							</TouchableOpacity>
						</Block>

						<Block marginTop={5} column>
							<Text>Duration in days: </Text>
							<Input
								placeholder={'1'}
								onChangeText={e => {
									setLeaveData({
										...leaveData,
										duration: e,
										end_date: moment(leaveData?.start_date).add(parseInt(e) - 1, "days")
									})
									// console.log({
									// 	...leaveData,
									// 	duration: e,
									// 	end_date: moment(leaveData?.start_date).add(e, "days")
									// })
								}}
								type="number-pad"
								color="black"
							/>
						</Block>
					</Block>
				}

				{/* {showDateAndroid.start_date && (
					<RNDateTimePicker
						mode="date"
						value={date}
						display={"calendar"}
						textColor="white"
						style={{
							height: 120,
						}}
						onChange={handleChangeDateAndroidStartDate}
					/>
				)} */}
				{/* {showDateAndroid.end_date && (
					<RNDateTimePicker
						mode="date"
						value={date}
						display={"calendar"}
						textColor="white"
						style={{
							height: 120,
						}}
						onChange={handleChangeDateAndroidEndDate}
					/>
				)} */}
				{/* {Platform.OS === "ios" &&
					<Block style={[{ marginTop: 100, padding: 20 }, styles.glassBox]} center>
						<Block marginTop={5} row>
							<TouchableOpacity onPress={() => setShowStartDateIos(true)}>
								<Text bold>Select Start Date</Text>
							</TouchableOpacity>
							{showStartDateIos ?
								// <RNDateTimePicker
								// 	testID="dateTimePicker"
								// 	value={date}
								// 	mode={mode}
								// 	is24Hour={true}
								// 	onChange={handleChangeDateIosStartDate}
								// /> 
								<></>
								: <Text style={{ marginHorizontal: 8 }}>{moment(leaveData?.start_date).format('D MMM YYYY')}</Text>}
						</Block>

						<Block marginTop={5} row>
							<TouchableOpacity onPress={() => setShowEndDateIos(true)}>
								<Text bold>Select End Date</Text>
							</TouchableOpacity>
							{showEndDateIos ?
								// <RNDateTimePicker
								// 	testID="dateTimePicker"
								// 	value={date}
								// 	mode={mode}
								// 	is24Hour={true}
								// 	onChange={handleChangeDateIosEndDate}
								// />
								<></>
								: <Text style={{ marginHorizontal: 8 }}>{moment(leaveData?.end_date).format('D MMM YYYY')}</Text>}
						</Block>
					</Block>} */}

				<Block center style={styles.section1}>

				</Block>

				<Block center flex style={[styles.section2, styles.glassBox]}>
					<ScrollView
						vertical={true}
						showsVerticalScrollIndicator={false}
						style={{
							width: "90%",
						}}
					>
						<Block
							column
							style={{
								justifyContent: "space-between",
								marginTop: 24,
								marginBottom: 12,

							}}
						>
							<Block style={{ width: "100%" }}>
								<TouchableOpacity onPress={() => console.log(userData)}>
									<Text>Select Your Project:</Text>
								</TouchableOpacity>
								{/* <Input
									placeholder="Maternity Leave"
									color="#3d3d3d"
									style={styles.glassInput}
								/> */}
								<SelectDropdown
									data={userData.projects}
									buttonStyle={{
										width: "100%",
										height: 40,
										borderRadius: 10
									}}
									// dropdownStyle={{
									// 	width:"80%"
									// }}
									defaultButtonText={userData?.current_project_name || "Select Project"}
									// defaultButtonText={"kontol"}
									onSelect={(selectedItem, index) => {
										setCurrentProject(selectedItem.id)
									}}
									buttonTextAfterSelection={(selectedItem, index) => {
										// text represented after item is selected
										// if data array is an array of objects then return leaveCategory.property to render after item is selected
										return selectedItem.name
									}}
									rowTextForSelection={(item, index) => {
										// text represented for each item in dropdown
										// if data array is an array of objects then return item.property to represent item in dropdown
										return item?.name
									}}

								/>
							</Block>
							<Block style={{ width: "100%", marginTop: 20 }}>
								<Text>Leave Type</Text>
								{/* <Input
									placeholder="Maternity Leave"
									color="#3d3d3d"
									style={styles.glassInput}
								/> */}
								<SelectDropdown
									data={leaveCategories}
									buttonStyle={{
										width: "100%",
										height: 40,
										borderRadius: 10
									}}
									// dropdownStyle={{
									// 	width:"80%"
									// }}
									defaultButtonText="Select Leave Type"
									onSelect={(leaveCategory, index) => {
										setLeaveData({ ...leaveData, leave_category_id: leaveCategory?.id })
									}}
									buttonTextAfterSelection={(leaveCategory, index) => {
										// text represented after item is selected
										// if data array is an array of objects then return leaveCategory.property to render after item is selected
										return leaveCategory.name
									}}
									rowTextForSelection={(item, index) => {
										// text represented for each item in dropdown
										// if data array is an array of objects then return item.property to represent item in dropdown
										return item?.name
									}}
								/>
							</Block>

							{/* <Block width={"30%"}>
								<Text>Duration</Text>
								<Input
									placeholder="1"
									value={leaveData.balance}
									color="#3d3d3d"
									style={styles.glassInput}
									onChangeText={(e) => handleLeaveDataChange("duration", e)}
								/>
							</Block> */}
						</Block>

						<Block
							style={{
								marginBottom: 18,
							}}
						>
							<Text
								style={{
									marginBottom: 5,
								}}
							>
								Leave Notes
							</Text>

							<TextInput
								editable
								multiline
								numberOfLines={4}
								maxLength={255}
								// onChangeText={text => onChangeText(text)}
								// value={value}
								style={[
									{
										padding: 10,
										borderWidth: 1,
										borderRadius: 12,
										marginTop: 8,
										minHeight: 80,
									},
									styles.glassInput,
								]}
								collapsable
								allowFontScaling={false}
								inputMode={"text"}
								placeholder="Write notes here . . ."
								placeholderTextColor={"rgba(0, 0, 0, 0.3)"}
							/>
						</Block>

						<Block>
							<Text
								style={{
									marginBottom: 24,
								}}
							>
								Leave Summary
							</Text>

							<Block
								card
								style={[
									{
										padding: 10,
									},
									styles.glassInput,
								]}
							>
								<Block
									row
									style={{
										justifyContent: "space-between",
										marginBottom: 12,
									}}
								>
									<Text bold color="gray">Start Date</Text>
									<Text>
										{moment(leaveData.start_date).format("DD MMM YYYY")}
									</Text>
								</Block>

								<Block
									row
									style={{
										justifyContent: "space-between",
										marginBottom: 12,
									}}
								>
									<Text bold color="gray">End Date</Text>
									<Text>
										{leaveData.end_date === ""
											? "please fill duration"
											: moment(leaveData?.end_date).format("DD MMM YYYY")}
									</Text>
								</Block>

								<Block
									row
									style={{
										justifyContent: "space-between",
										marginBottom: 12,
									}}
								>
									<Text bold color="gray">Duration</Text>
									{(leaveData?.start_date && leaveData?.end_date) &&
										<Text>{parseInt(leaveData?.end_date?.diff(leaveData?.start_date, "days")) + 1} days</Text>
									}
								</Block>
								<Block
									row
									style={{
										justifyContent: "space-between",
									}}
								>
									<Text bold color="gray">Leave Type</Text>
									<Text>{leaveCategories.find(x => (x?.id === leaveData?.leave_category_id))?.name}</Text>
								</Block>
							</Block>
						</Block>
						<Block w="100%">
							{image ?
								<Block center>
									<Image
										source={{ uri: image?.uri }}
										resizeMode="contain"
										style={{ width: width, height: width }}
									/>
								</Block>
								: <></>}

							{!image ? <Button
								style={[styles.attachmentButton, { backgroundColor: "green" }]}
								onPress={pickImage}>
								+ Attachment
							</Button> : <Button
								style={[styles.attachmentButton, { backgroundColor: "#b20000" }]}
								onPress={() => {
									setImage(null);
									setBlob(null);
								}}>
								x Delete Attachment
							</Button>}
						</Block>
					</ScrollView>


					<Block
						center
						style={{
							width: "100%",
						}}
					>
						<Button
							color={"#2D7482"}
							onPress={handleSubmit}
							isLoading={isLoading}
							disabled={isLoading}
							style={[
								{
									width: width - theme.SIZES.BASE * 4,
									height: theme.SIZES.BASE * 3,
								},
								styles.glassButton,
							]}
						>
							SUBMIT REQUEST
						</Button>
					</Block>
				</Block>
			</ImageBackground>
			<Modal
				animationType="slide"
				transparent={true}
				visible={showDatePicker}
				onRequestClose={() => {
					setShowDatePicker(!showDatePicker);
				}}>
				<View style={styles.centeredView}>
					<View style={styles.modalView}>
						<Block marginTop={2}>

							<SelectDropdown
								style={{ marginTop: 5 }}
								data={months}
								onSelect={(selectedItem, index) => {
									setSelectedMonth(selectedItem?.value)
								}}
								buttonTextAfterSelection={(selectedItem, index) => {
									// text represented after item is selected
									// if data array is an array of objects then return selectedItem.property to render after item is selected
									return selectedItem.name
								}}
								rowTextForSelection={(item, index) => {
									// text represented for each item in dropdown
									// if data array is an array of objects then return item.property to represent item in dropdown
									return item.name
								}}
								defaultButtonText={moment().format('MMMM')}

							/>
						</Block>
						<Block marginTop={5}>
							<SelectDropdown
								style={{ marginTop: 5 }}
								data={renderDate()}
								onSelect={(selectedItem, index) => {
									setSelectedDay(selectedItem)
								}}
								buttonTextAfterSelection={(selectedItem, index) => {
									// text represented after item is selected
									// if data array is an array of objects then return selectedItem.property to render after item is selected
									return selectedItem
								}}
								rowTextForSelection={(item, index) => {
									// text represented for each item in dropdown
									// if data array is an array of objects then return item.property to represent item in dropdown
									return item
								}}
								defaultButtonText={moment().format('DD')}

							/>
						</Block>
						<Block marginTop={5}>
							<SelectDropdown
								style={{ marginTop: 5 }}
								data={years}
								onSelect={(selectedItem, index) => {
									setSelectedYear(item)
								}}
								buttonTextAfterSelection={(selectedItem, index) => {
									// text represented after item is selected
									// if data array is an array of objects then return selectedItem.property to render after item is selected
									return selectedItem
								}}
								rowTextForSelection={(item, index) => {
									// text represented for each item in dropdown
									// if data array is an array of objects then return item.property to represent item in dropdown
									return item
								}}
								defaultButtonText={moment().format('YYYY')}
							/>
						</Block>
						<TouchableOpacity
							style={[styles.button, styles.buttonClose, { marginTop: 10 }]}
							onPress={handleCloseModal}>
							<Text style={styles.textStyle}>Continue</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</Fragment>
	);
}

export default NewLeave;

const styles = StyleSheet.create({
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
	main: {
		flex: 1,
		backgroundColor: "#3d3d3d",
	},
	section1: {
		width: "90%",
		marginTop:
			Platform.OS === "android"
				? height * 0.06
				: Platform.OS === "ios" && !iPhoneNotch
					? height * 0.06
					: height * 0.05,
		position: "relative",
		alignItems: "center",
		maxHeight: height * 0.2,
	},
	section2: {
		width: "95%",
		position: "relative",
		marginTop: -theme.SIZES.BASE * 1,
		marginBottom: 0,
		borderTopLeftRadius: 13,
		borderTopRightRadius: 13,
	},
	glassBox: {
		backgroundColor: "rgba(255, 255, 255, 0.75)",
		// borderTopLeftRadius: 16,
		// borderTopRightRadius: 16,
		// borderBottomLeftRadius: 16,
		// borderBottomRightRadius: 16,
		borderRadius: 16,
		shadowColor: "rgba(255, 255, 255, 0.1)",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowRadius: 30,
		shadowOpacity: 1,
		elevation: 5, // For Android shadow
		borderWidth: 1,
		borderColor: "rgba(255, 255, 255, 0.3)",
	},
	glassInput: {
		backgroundColor: "rgba(255, 255, 255, 0.5)",
		shadowColor: "rgba(255, 255, 255, 0.1)",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowRadius: 30,
		shadowOpacity: 1,
		elevation: 5, // For Android shadow
		borderWidth: 1,
		borderColor: "rgba(255, 255, 255, 0.3)",
	},
	glassTime: {
		backgroundColor: "rgba(255, 255, 255, 0.21)",
		shadowColor: "rgba(255, 255, 255, 0.1)",
		borderRadius: 8,
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowRadius: 30,
		shadowOpacity: 1,
		elevation: 5, // For Android shadow
		borderWidth: 1,
		borderColor: "rgba(255, 255, 255, 0.3)",
	},
	glassButton: {
		backgroundColor: "rgba(65, 114, 128, 1)",
		shadowColor: "rgba(65, 114, 128, 0.1)",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowRadius: 30,
		shadowOpacity: 1,
		elevation: 5, // For Android shadow
		borderWidth: 1,
		borderColor: "rgba(65, 114, 128, 0.3)",
	},
	attachmentButton: {
		width: width - theme.SIZES.BASE * 4,
		height: theme.SIZES.BASE * 3,
	},
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 22,
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
