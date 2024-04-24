import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import TimeOffLogScreen from "../../screens/App/HRIS/TimeOff/TimeOffLog";
import { tabs } from '../../constants';
import { Header } from '../../components';
import ApprovalPreviewScreen from '../../screens/App/HRIS/ApprovalPreviewScreen';


const Stack = createNativeStackNavigator();

function TimeOffStack(props) {
  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: "screen",
      }}
      initialRouteName="TimeOffLog"
    >
      <Stack.Screen
        name="TimeOffLog"
        component={TimeOffLogScreen}
        options={{
          header: ({ navigation, scene, route }) => (
            <Header
              back
              white
              transparent
              // tabs={tabs.timeoffs}
              // tabIndex={tabs.timeoffs[1].id}
              title="Leave"
              navigation={navigation}
              route={route}
              scene={scene}
            />
          ),
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="ApprovalPreview"
        component={ApprovalPreviewScreen}
        options={{
          header: ({ navigation, scene, route }) => (
            <Header
              back
              // white
              // transparent
              // tabs={tabs.timeoffs}
              // tabIndex={tabs.timeoffs[1].id}
              title="Preview"
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

export default TimeOffStack