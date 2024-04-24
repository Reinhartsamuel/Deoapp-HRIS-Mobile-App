import React, { Fragment, useEffect, useState } from "react";
import {
	StyleSheet,
	Dimensions,
	Platform,
	ImageBackground,
	Alert,
} from "react-native";
import { Block, Text, Button, theme } from "galio-framework";

import * as Location from "expo-location";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";

import materialTheme from "../../../../constants/Theme";
import { iPhoneNotch } from "../../../../constants/utils";
import Theme from "../../../../constants/Theme";
import useLocationStore from "../../../../store/location";
import LogAttendance from "../../../../components/LogAttendance";

const { height, width } = Dimensions.get("window");

const AttendanceHeader = () => {
	const [currentTime, setCurrentTime] = useState(
		moment().format("kk : mm : ss")
	);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(moment().format("kk : mm : ss"));
		}, 1000); // Update every 1 second
		return () => {
			clearInterval(interval);
		};
	}, []);

	return (
		<Block style={[styles.attendanceHeader]}>
			<Text
				size={
					Platform.OS === "android"
						? 28
						: Platform.OS === "ios" && !iPhoneNotch
							? 20
							: 28
				}
				color={"#ffffff"}
				style={{
					fontWeight: "500",
					marginBottom: 18,
				}}
				allowFontScaling={false}
			>
				Live Attendance
			</Text>

			<Text
				size={
					Platform.OS === "android"
						? 36
						: Platform.OS === "ios" && !iPhoneNotch
							? 24
							: 36
				}
				color={"#ffffff"}
				style={{
					fontWeight: "700",
				}}
				allowFontScaling={false}
			>
				{currentTime}
			</Text>

			<Text
				size={
					Platform.OS === "android"
						? 14
						: Platform.OS === "ios" && !iPhoneNotch
							? 12
							: 14
				}
				color={"#ffffff"}
				style={{
					fontWeight: "300",
					marginBottom: 16,
				}}
				allowFontScaling={false}
			>
				{moment().format('llll')}
			</Text>
		</Block>
	);
};

// const LogBox = ({ currentAttendance, lastIndex }) => {
// 	return (
// 		<>
// 			<Block margin={10}>

// 				<Text
// 					size={14}
// 					bold
// 					allowFontScaling={false}
// 					style={{
// 						marginBottom: 5,
// 					}}
// 					color="#4d4d4d"
// 				>
// 					{/* {moment(currentAttendance?.createdAt).format()} */}
// 					{moment
// 						.parseZone(currentAttendance?.createdAt)
// 						.local()
// 						.format('ddd, D MMM YYYY')}
// 				</Text>
// 				<Block
// 					flex
// 					row
// 					card
// 					style={[
// 						{
// 							padding: theme.SIZES.BASE * 0.6,
// 							marginBottom: lastIndex ? 50 : 18,
// 							justifyContent: "space-between",
// 							backgroundColor: Theme.COLORS.SECONDARY,
// 						},
// 						// styles.shadow,
// 					]}
// 				>
// 					<Block column>
// 						{currentAttendance?.clock_in ? (
// 							<Block style={[styles.roundTopLeft]}>
// 								<Image
// 									source={{
// 										uri: currentAttendance?.image_in,
// 									}}
// 									style={styles.avatar}
// 								/>
// 								<Text
// 									size={12}
// 									bold
// 									allowFontScaling={false}
// 									style={{
// 										marginTop: 5,
// 									}}
// 								>
// 									{moment
// 										.parseZone(currentAttendance?.clock_in)
// 										.local()
// 										.format("hh : mm : ss")}
// 									{/* {moment(currentAttendance?.clock_in).format("hh : mm : ss")} */}
// 								</Text>
// 							</Block>
// 						) : (
// 							<Block
// 								flex
// 								style={{
// 									alignItems: "center",
// 									alignContent: "center",
// 									justifyContent: "center",
// 								}}
// 							>
// 								<Text size={10} allowFontScaling={false}>
// 									No Clock Out Data !
// 								</Text>
// 							</Block>
// 						)}
// 					</Block>
// 					<Block column>
// 						{currentAttendance?.clock_out ? (
// 							<Block style={styles.roundTopLeft}>
// 								<Image
// 									source={{
// 										uri: currentAttendance?.image_out,
// 									}}
// 									style={styles.avatar}
// 								/>
// 								<Text
// 									size={12}
// 									bold
// 									allowFontScaling={false}
// 									style={{
// 										marginTop: 5,
// 									}}
// 								>
// 									{moment
// 										.parseZone(currentAttendance?.clock_out)
// 										.local()
// 										.format("hh : mm : ss")}
// 									{/* {moment(currentAttendance?.clock_out).format("HH : mm : ss")} */}
// 								</Text>
// 							</Block>
// 						) : (
// 							<Block
// 								flex
// 								style={{
// 									alignItems: "center",
// 									alignContent: "center",
// 									justifyContent: "center",
// 								}}
// 							>
// 								<Text size={10} allowFontScaling={false}>
// 									No Clock Out Data
// 								</Text>
// 							</Block>
// 						)}
// 					</Block>
// 				</Block>
// 				{/* <Text>{JSON.stringify(currentAttendance)}</Text> */}
// 			</Block>
// 		</>
// 	);
// };

function LiveAttendance({ navigation }) {
	const [currentAttendance, setCurrentAttendance] = useState({});

	const [loading, setLoading] = useState(true);
	const [lat, setLat] = useState("");
	const [long, setLong] = useState("");
	const [errorMsg, setErrorMsg] = useState("");
	const { latitude: latStore, longitude: longStore } = useLocationStore();
	const [currentAddress, setCurrentAddress] = useState(null);



	const getLocationAsync = async () => {
		try {
			let resf = await Location.getForegroundPermissionsAsync();
			let resb = await Location.getBackgroundPermissionsAsync();

			if (resf.status !== "granted") {
				Alert.alert("Permission to access location was denied");
				setErrorMsg("Permission to access location was denied");
			} else {
				console.log("Permission to access location granted");
			}

			let location = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.BestForNavigation,
				timeInterval: 5000, // 5 seconds interval
			});

			
			setLat(location.coords.latitude);
			setLong(location.coords.longitude);
			
			if (!latStore || !longStore) {
				const address = await Location.reverseGeocodeAsync({ latitude: location.coords.latitude, longitude: location.coords.longitude });
				setCurrentAddress(address[0]);
				console.log("address::", address[0]);
			} else {
				const address = await Location.reverseGeocodeAsync({ latitude: latStore, longitude: longStore });
				setCurrentAddress(address[0]);
				console.log("address::", address[0]);
			};
			setLoading(false);
		} catch (error) {
			throw error;
		};
	};



	const renderCurrentLocation = () => {
		if (loading || ((!latStore && !lat) || (!longStore && !long))) {
			return "Getting current location . . ."
		} else if (errorMsg !== "") {
			return errorMsg
		}
		// return `${latStore || lat}, ${longStore || long}`
		// return currentAddress?.name
		return `${currentAddress?.street}, ${currentAddress?.name} ${currentAddress?.district} ${currentAddress?.subregion}`
	};

	useEffect(() => {
		if (!latStore && !longStore) {
			getLocationAsync();
		};

		return () => { };
	}, []);


	return (
		<Fragment>
			<ImageBackground
				source={require("../../../../assets/images/imagesvg.png")}
				style={styles.main}
				imageStyle={{
					opacity: 0.8,
				}}
			>
				<Block flex style={styles.liveAttendance}>
					<Block flex style={styles.section1}>
						<AttendanceHeader />

						<Block center style={[styles.attendanceBox, styles.glass]}>
							<Block center style={styles.attendanceBoxHeader}>
								<Text
									style={{
										fontSize:
											Platform.OS === "android"
												? 18
												: Platform.OS === "ios" && !iPhoneNotch
													? 10
													: 18,
									}}
									color={Theme.COLORS.SECONDARY}
									allowFontScaling={false}
								>
									Schedule: 20 Aug 2023
								</Text>

								<Text
									style={{
										marginTop: 10,
										fontSize:
											Platform.OS === "android"
												? 22
												: Platform.OS === "ios" && !iPhoneNotch
													? 16
													: 22,
										fontWeight: "600",
									}}
									allowFontScaling={false}
									color={Theme.COLORS.SECONDARY}
								>
									09:00 - 18:00
								</Text>
							</Block>

							<Block
								flex
								row
								style={{
									// backgroundColor: "#ffd600",
									justifyContent: "center",
									alignItems: "center",
									width: width * 0.9 * 0.85,
								}}
							>
								<Ionicons
									name="location"
									size={16}
									color={Theme.COLORS.SECONDARY}
									style={{
										marginRight: 8,
									}}
								/>

								<Text
									style={{
										fontWeight: "500",
									}}
									color={Theme.COLORS.SECONDARY}
									size={12}
									allowFontScaling={false}
								>
									{renderCurrentLocation()}
								</Text>
							</Block>

							<Button
								color={
									loading === true
										? "grey"
										: currentAttendance?.clock_in && currentAttendance?.clock_out
											? "#8f8f8f"
											: Theme.COLORS.BUTTON_COLOR
								}
								size={
									Platform.OS === "android"
										? "large"
										: Platform.OS === "ios" && !iPhoneNotch
											? "small"
											: "large"
								}
								style={[
									{
										width: width * 0.8,
										height: height * 0.05,
									},
									styles.glassButton,
								]}
								onPress={() => navigation.navigate("AttendanceCamera3", {
									lat,
									long
								})}
							// disabled={isButtonDisabled()}
							>
								<Text
									color={"#ffffff"}
									style={{
										fontSize:
											Platform.OS === "android"
												? 14
												: Platform.OS === "ios" && !iPhoneNotch
													? 12
													: 14,
										fontWeight: "600",
									}}
									allowFontScaling={false}
								>
									Submit Attendance
								</Text>
							</Button>
						</Block>
					</Block>

					<Block flex style={[styles.section2, styles.glassBox]}>
						<LogAttendance navigation={navigation} />
					</Block>
				</Block>
			</ImageBackground>
		</Fragment>
	);
}

export default LiveAttendance;

const styles = StyleSheet.create({
	main: {
		flex: 1,
		backgroundColor: "#3d3d3d",
	},
	section1: {
		marginTop:
			Platform.OS === "android"
				? height * 0.07
				: Platform.OS === "ios" && !iPhoneNotch
					? height * 0.06
					: height * 0.09,
		// position: "relative",
		alignItems: "center",
	},
	attendanceHeader: {
		justifyContent: "center",
		alignItems: "center",
		marginBottom:
			Platform.OS === "android"
				? 15
				: Platform.OS === "ios" && !iPhoneNotch
					? 15
					: 50,
	},
	attendanceBox: {
		justifyContent: "space-between",
		height:
			Platform.OS === "android"
				? (height * 1) / 4.5
				: Platform.OS === "ios" && !iPhoneNotch
					? (height * 1) / 4.3
					: (height * 1) / 5,
		alignItems: "center",
		width: width * 0.9,
		paddingBottom: 5,
	},
	attendanceBoxHeader: {
		paddingTop: 15,
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
	},
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
	galleryImage: {
		width: width,
		height: "auto",
	},
	dots: {
		// height: theme.SIZES.BASE / 2,
		// margin: theme.SIZES.BASE / 2,
		borderRadius: 4,
		backgroundColor: "white",
	},
	dotsContainer: {
		position: "absolute",
		// bottom: theme.SIZES.BASE,
		// left: 0,
		// // right: 0,
		// bottom: height / 12,
	},
	addToCart: {
		width: width - theme.SIZES.BASE * 4,
		marginTop: theme.SIZES.BASE * 2,
		shadowColor: "rgba(0, 0, 0, 0.2)",
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 8,
		shadowOpacity: 1,
	},
	chat: {
		width: 56,
		height: 56,
		padding: 20,
		borderRadius: 28,
		shadowColor: "rgba(0, 0, 0, 0.2)",
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 8,
		shadowOpacity: 1,
	},
	chatContainer: {
		top: -30,
		right: theme.SIZES.BASE,
		zIndex: 2,
		position: "absolute",
	},
	size: {
		height: theme.SIZES.BASE * 3,
		width: (width - theme.SIZES.BASE * 2) / 3,
		borderBottomWidth: 0.5,
		borderBottomColor: materialTheme.COLORS.BORDER_COLOR,
		overflow: "hidden",
	},
	sizeButton: {
		height: theme.SIZES.BASE * 3,
		width: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
	active: {
		backgroundColor: materialTheme.COLORS.PRICE_COLOR,
	},
	roundTopLeft: {
		borderTopLeftRadius: 4,
		borderRightColor: materialTheme.COLORS.BORDER_COLOR,
		borderRightWidth: 0.5,
		width: width * 0.2,
		alignItems: "center",
		justifyContent: "center",
		alignContent: "center",
	},
	roundBottomLeft: {
		borderBottomLeftRadius: 4,
		borderRightColor: materialTheme.COLORS.BORDER_COLOR,
		borderRightWidth: 0.5,
		borderBottomWidth: 0,
	},
	roundTopRight: {
		borderTopRightRadius: 4,
		borderLeftColor: materialTheme.COLORS.BORDER_COLOR,
		borderLeftWidth: 0.5,
	},
	roundBottomRight: {
		borderBottomRightRadius: 4,
		borderLeftColor: materialTheme.COLORS.BORDER_COLOR,
		borderLeftWidth: 0.5,
		borderBottomWidth: 0,
	},
	glass: {
		backgroundColor: "rgba(255, 255, 255, 0.2)",
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
	glassBox: {
		backgroundColor: "rgba(255, 255, 255, 0.75)",
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
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
	glassButton: {
		backgroundColor: "rgba(69, 112, 121, 1)",
		shadowColor: "rgba(69, 112, 121, 0.3)",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowRadius: 30,
		shadowOpacity: 1,
		elevation: 5, // For Android shadow
		borderWidth: 1,
		borderColor: "rgba(69, 112, 121, 0.7)",
	},
});
