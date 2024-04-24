import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LiveAttendanceScreen from "../../screens/App/HRIS/Attendance/LiveAttendance2";
import AttendanceCameraScreen from "../../screens/App/HRIS/Attendance/AttendanceCamera";
import { Header } from '../../components';
import AttendanceCamera3 from '../../screens/App/HRIS/Attendance/AttendanceCamera3';
import NonManagementAttendance from '../../screens/App/HRIS/Attendance/NonManagementAttendance';
import AttendanceClone from '../../screens/App/HRIS/Attendance/AttendanceClone';


const Stack = createNativeStackNavigator();


function LiveAttendanceStack(props) {
  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: "screen",
      }}
      initialRouteName="LiveAttendance"
    >
      <Stack.Screen
        name="LiveAttendanceScreen"
        component={LiveAttendanceScreen}
        options={{
          unmountOnBlur: true,
          header: ({ navigation, scene }) => (
            <Header
              back
              white
              transparent
              title=""
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="AttendanceCamera"
        component={AttendanceCameraScreen}
        options={{
          unmountOnBlur: true,
          header: ({ navigation, scene }) => (
            <Header
              back
              white
              transparent
              title=""
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="AttendanceCamera3"
        component={AttendanceClone}
        options={{
          unmountOnBlur: true,
          presentation: "card",
          header: ({ navigation, scene }) => (
            <Header
              back
              white={false}
              transparent
              title=""
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="NonManagementAttendance"
        component={NonManagementAttendance}
        options={{
          headerShown: false,
          // presentation:"card",
          header: ({ navigation, scene }) => (
            <Header
              back
              white={true}
              transparent
              title=""
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default LiveAttendanceStack