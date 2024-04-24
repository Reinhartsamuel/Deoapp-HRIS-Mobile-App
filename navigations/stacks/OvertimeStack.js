import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OvertimeLogScreen from "../../screens/App/HRIS/Overtime/OvertimeLog";
import { Header } from '../../components';


const Stack = createNativeStackNavigator();


function OvertimeStack(props) {
    return (
      <Stack.Navigator
        screenOptions={{
          mode: "card",
          headerShown: "screen",
        }}
        initialRouteName="OvertimeLog"
      >
        <Stack.Screen
          name="OvertimeLog"
          component={OvertimeLogScreen}
          options={{
            header: ({ navigation, scene, route }) => (
              <Header
                back
                white
                transparent
                title="Overtime"
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

export default OvertimeStack