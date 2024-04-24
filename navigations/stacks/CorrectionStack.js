import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CorrectionLogScreen from "../../screens/App/HRIS/Corrections/CorrectionLog";
import { tabs } from '../../constants';
import { Header } from '../../components';


const Stack = createNativeStackNavigator();


function CorrectionStack(props) {
	return (
		<Stack.Navigator
			screenOptions={{
				mode: "card",
				headerShown: "screen",
			}}
			initialRouteName="CorrectionLog"
		>
			<Stack.Screen
				name="CorrectionLog"
				component={CorrectionLogScreen}
				options={{
					header: ({ navigation, scene, route }) => (
						<Header
							back
							white
							transparent
							// tabs={tabs.corrections}
							// tabIndex={tabs.corrections[1].id}
							title="Corrections"
							navigation={navigation}
							route={route}
							scene={scene}
						/>
					),
					headerTransparent: true,
				}}
			/>
		</Stack.Navigator>
	);
}

export default CorrectionStack