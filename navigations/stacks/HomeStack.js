import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from "../../screens/App/Home";
import LiveAttendanceStack from './LiveAttendanceStack';
import AttendanceLogStack from './AttendanceLogStack';
import CorrectionStack from './CorrectionStack';
import TimeOffStack from './TimeOffStack';
import CoursesStack from './CoursesStack';
import OvertimeStack from './OvertimeStack';
import PayslipStack from './PayslipStack';
import NewCorrectionScreen from "../../screens/App/HRIS/Corrections/NewCorrection";
import NewOvertimeScreen from "../../screens/App/HRIS/Overtime/NewOvertime";
import { Header } from '../../components';
import NewLeave from '../../screens/App/HRIS/TimeOff/NewLeave';
import AnnouncementPreview from '../../screens/App/Home/AnnouncementPreview';



const Stack = createNativeStackNavigator();

function HomeStack(props) {
  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: "screen",
      }}
    >
      <Stack.Screen
        name="HomeScreen"
        headerShown={false}
        component={HomeScreen}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              // search
              // options
              transparent
              white
              title=""
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="AnnouncementPreview"
        headerShown={false}
        component={AnnouncementPreview}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              // search
              // options
              transparent={false}
              white={false}
              title=""
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="LiveAttendance"
        component={LiveAttendanceStack}
        options={{
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
        name="AttendanceLogStack"
        component={AttendanceLogStack}
        options={{
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
          headerShown: false,
          // headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="CorrectionLogsStack"
        component={CorrectionStack}
        options={{
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
          headerShown: false,
          // headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="NewCorrectionScreen"
        component={NewCorrectionScreen}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              back
              white
              transparent
              title="Request Correction"
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="TimeOffLogStack"
        component={TimeOffStack}
        options={{
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
          headerShown: false,
          // headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="NewLeaveScreen"
        component={NewLeave}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              back
              white
              transparent
              title="Request Leave"
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="OvertimeLogStack"
        component={OvertimeStack}
        options={{
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
          headerShown: false,
          // headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="NewOvertimeScreen"
        component={NewOvertimeScreen}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              back
              white
              transparent
              title="Request Overtime"
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="PayslipLogStack"
        component={PayslipStack}
        options={{
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
          headerShown: false,
          // headerTransparent: true,
        }}
      />
      {/* <Stack.Screen
          name="Courses"
          component={CoursesStack}
          options={{
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
            headerShown: false,
            // headerTransparent: true,
          }}
        /> */}
      <Stack.Screen
        name="CoursesStack"
        component={CoursesStack}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              back
              white
              transparent
              title="Courses"
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

export default HomeStack