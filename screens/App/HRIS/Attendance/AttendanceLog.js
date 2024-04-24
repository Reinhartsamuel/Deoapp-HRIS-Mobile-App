import { Block, Button, Text, theme } from "galio-framework";
import React, { Fragment, useCallback, useEffect, useState } from "react";
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
// import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { auth } from "../../../../configs/firebase";
import { iPhoneNotch } from "../../../../constants/utils";

import axios from "axios";
import moment from "moment";
// import RNDateTimePicker from "@react-native-community/datetimepicker";
import Theme from "../../../../constants/Theme";
// import DatePicker from "@dietime/react-native-date-picker";
import DateComponentAndroid from "../../../../components/DateComponentAndroid";
// import MonthPicker from 'react-native-month-year-picker';
import SelectDropdown from "react-native-select-dropdown";
// DateTimePickerAndroid.open(params: AndroidNativeProps)
// DateTimePickerAndroid.dismiss(mode: AndroidNativeProps['mode'])

const { height, width } = Dimensions.get("window");

const LogBox = ({ currentAttendance, lastIndex }) => {
	return (
		<>
			<Text
				size={14}
				bold
				allowFontScaling={false}
				style={{
					marginBottom: 5,
				}}
				color="#4d4d4d"
			>
				{moment.parseZone(currentAttendance?.periode).local().format("dddd, DD-MM-YYYY")}
			</Text>

			<Block
				flex
				row
				card
				style={[
					{
						padding: theme.SIZES.BASE * 0.6,
						marginBottom: lastIndex ? 50 : 18,
						justifyContent: "space-between",
						backgroundColor: Theme.COLORS.SECONDARY,
					},
					// styles.shadow,
				]}
			>
				<Block column>
					{currentAttendance?.clock_in ? (
						<Block style={[styles.roundTopLeft]}>
							<Image
								source={{
									uri: currentAttendance?.image_in,
								}}
								style={styles.avatar}
							/>

							<Text
								size={12}
								bold
								allowFontScaling={false}
								style={{
									marginTop: 5,
								}}
							>
								{/* {moment
									.parseZone(currentAttendance?.clock_in)
									.local()
									.format("HH : mm : ss")} */}
								{moment.parseZone(currentAttendance?.clock_in).local().format("HH : mm : ss")}
							</Text>
						</Block>
					) : (
						<Block
							flex
							style={{
								alignItems: "center",
								alignContent: "center",
								justifyContent: "center",
							}}
						>
							<Text size={10} allowFontScaling={false}>
								No Clock Out Data 1
							</Text>
						</Block>
					)}
				</Block>

				<Block column>
					{currentAttendance?.clock_out ? (
						<Block style={styles.roundTopLeft}>
							<Image
								source={{
									uri: currentAttendance?.image_out,
								}}
								style={styles.avatar}
							/>

							<Text
								size={12}
								bold
								allowFontScaling={false}
								style={{
									marginTop: 5,
								}}
							>
								{/* {moment
									.parseZone(currentAttendance?.clock_out)
									.local()
									.format("HH : mm : ss")} */}
								{moment.parseZone(currentAttendance?.clock_out).local().format("HH : mm : ss")}

							</Text>
						</Block>
					) : (
						<Block
							flex
							style={{
								alignItems: "center",
								alignContent: "center",
								justifyContent: "center",
							}}
						>
							<Text size={10} allowFontScaling={false}>
								No Clock Out Data
							</Text>
						</Block>
					)}
				</Block>
			</Block>
		</>
	);
};

const dates = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
const months = [{ name: "January", value: 1 }, { name: "February", value: 2 }, { name: "March", value: 3 }, { name: "April", value: 4 }, { name: "May", value: 5 }, { name: "June", value: 6 }, { name: "July", value: 7 }, { name: "August", value: 8 }, { name: "September", value: 9 }, { name: "October", value: 10 }, { name: "November", value: 11 }, { name: "December", value: 12 }];
const years = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

function AttendanceLog() {
	// ** State
	const currentYear = moment().format("YYYY");
	const currentMonth = moment().format("MM");
	const currentDay = moment().format("DD");
	const [mode, setMode] = useState("date");
	const [date, setDate] = useState(new Date(currentYear, currentMonth, 0));
	const [attendanceData, setAttendanceData] = useState([]);
	const [selectedMonth, setSelectedMonth] = useState(currentMonth);
	const [selectedDay, setSelectedDay] = useState(currentDay);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [selectedYear, setSelectedYear] = useState(currentYear);
	const [loading, setLoading] = useState(false);


	const getAttendanceData = async () => {
		const myToken = auth.currentUser.stsTokenManager.accessToken;
		console.log(myToken);
		const config = {
			method: 'get',
			url: `https://asia-southeast2-deoapp-indonesia.cloudfunctions.net/hris/api/attendance/employee?month=${selectedMonth}&year=${selectedYear}`,
			headers: {
				'Authorization': `Bearer ${myToken}`
			}
		};

		try {
			const result = await axios(config);
			// console.log("result get attendance data : ", result.data.data);
			setAttendanceData(result?.data?.data);
		} catch (error) {
			console.log("error getting attendance data AL", error);
			Alert.alert(error.message)
		};
	};

	const handleChangeDate = async (date) => {
		const selectedDDDD = moment.unix(date / 1000).format("DDDD");
		const selectedMM = moment.unix(date / 1000).format("MM");
		const selectedYYYYY = moment.unix(date / 1000).format("YYYY");
		setDate(new Date(date));

		setShowDatePicker(false);

		const checkMonth = selectedMM !== selectedMonth;
		if (checkMonth) {
			setSelectedMonth(selectedMM);
			getAttendanceData(selectedMM, selectedYYYYY)
		};
	};


	const handleCloseModal = () => {
		setShowDatePicker(!showDatePicker);
		getAttendanceData(selectedMonth, selectedYear);
	};


	// ** Effects
	useEffect(() => {
		getAttendanceData(currentMonth, currentYear);
		// setDate(new Date(currentYear, currentMonth, 0));
	}, []);

	return (
		<Fragment>
			<ImageBackground
				source={require("../../../../assets/images/imagesvg.png")}
				style={styles.main}
			>
				<Block center flex style={styles.section1}>

					{/* {show && (
						<MonthPicker
							onChange={onValueChange}
							value={new Date()}
							minimumDate={new Date()}
							maximumDate={new Date(2025, 5)}
							locale="ko"
						/>
					)} */}

					{/* {showDatePicker && <RNDateTimePicker
						mode={"date"}
						value={date}
						maximumDate={new Date(currentYear, currentMonth, currentDay)}
						onChange={({ nativeEvent: { timestamp } }) =>
							handleChangeDate(timestamp)
						}
						testID="datePicker"
						display={"spinner"}
						style={{
							height: 120,
						}}
						themeVariant="dark"
					/>} */}

					{/* {(Platform.OS === "android" && showDatePicker) &&
						<>
							<RNDateTimePicker
								testID="dateTimePicker"
								value={date}
								mode={mode}
								is24Hour={true}
								onChange={handleChangeDate}
							/>
						</>
					} */}

					<DateComponentAndroid
						currentDay={selectedDay}
						currentMonth={selectedMonth}
						currentYear={selectedYear}
						setShowDatePicker={setShowDatePicker}
					/>
				</Block>




				<Block center flex style={[styles.section2, styles.glass]}>
					{attendanceData.length > 0 ? (
						<ScrollView
							vertical={true}
							showsVerticalScrollIndicator={false}
							style={{
								width: "90%",
								paddingTop: 24,
							}}
						>
							{attendanceData?.sort((a, b) => moment(b?.updatedAt) - moment(a?.updatedAt)).map((attendance, index) => {
								const lastIndex = attendanceData.length === index + 1;
								return (
									<LogBox
										key={index}
										currentAttendance={attendance}
										lastIndex={lastIndex}
									/>
								);
							})}
						</ScrollView>
					) : !loading ? (
						<>
							<Image
								style={{
									width: 250,
									height: 250,
								}}
								source={require("../../../../assets/images/select-date.png")}
							/>
							<Text bold size={18}>
								No Attendance Log Found
							</Text>
						</>
					) :
						<Block height="100%" center middle>
							<ActivityIndicator size="large" color="#0000ff" style={{ zIndex: 200 }} />
						</Block>
					}
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
									console.log(selectedItem, index)
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
								data={years}
								onSelect={(selectedItem, index) => {
									console.log(selectedItem, index)
									setSelectedYear(selectedItem)
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

export default AttendanceLog;

const styles = StyleSheet.create({
	avatar: {
		height:
			Platform.OS.OS === "android"
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
		width: "90%",
		position: "relative",
		marginTop: -theme.SIZES.BASE * 1,
		marginBottom: 0,
		borderTopLeftRadius: 13,
		borderTopRightRadius: 13,
		backgroundColor: theme.COLORS.WHITE,
		shadowColor: "black",
		shadowOffset: { width: 0, height: 0 },
		shadowRadius: 8,
		shadowOpacity: 0.2,
	},
	shadow: {
		shadowColor: theme.COLORS.BLACK,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 3,
		shadowOpacity: 0.1,
		elevation: 2,
	},
	glass: {
		backgroundColor: "rgba(255, 255, 255, 0.9)",
		//  borderRadius: 16,
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		shadowColor: "rgba(0, 0, 0, 0.1)",
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
