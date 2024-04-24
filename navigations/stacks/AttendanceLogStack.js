import React from 'react'
import AttendanceLogScreen from "../../screens/App/HRIS/Attendance/AttendanceLog";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Header } from '../../components';

const Stack = createNativeStackNavigator();

function AttendanceLogStack(props) {
    return (
      <Stack.Navigator
        screenOptions={{
          mode: "card",
          headerShown: "screen",
        }}
        initialRouteName="AttendanceLog"
      >
        <Stack.Screen
          name="AttendanceLog"
          component={AttendanceLogScreen}
          options={{
            header: ({ navigation, scene }) => (
              <Header
                back
                white
                transparent
                title="Attendance Log"
                navigation={navigation}
                scene={scene}
              />
            ),
            headerTransparent: true,
          }}
        />
      </Stack.Navigator>
    );
  }

export default AttendanceLogStack