import { View, Text } from 'react-native'
import React from 'react'
import PayslipLogScreen from "../../screens/App/HRIS/Payslip/PayslipLog";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Header } from '../../components';
import PayslipDetailScreen from '../../screens/App/HRIS/Payslip/PayslipDetail';

const Stack = createNativeStackNavigator();


function PayslipStack(props) {
    return (
      <Stack.Navigator
        screenOptions={{
          mode: "card",
          headerShown: "screen",
        }}
        initialRouteName="PayslipLog"
      >
        <Stack.Screen
          name="PayslipLog"
          component={PayslipLogScreen}
          options={{
            header: ({ navigation, scene, route }) => (
              <Header
                back
                white
                transparent
                // tabs={tabs.timeoffs}
                // tabIndex={tabs.timeoffs[1].id}
                title="Payslip"
                navigation={navigation}
                route={route}
                scene={scene}
              />
            ),
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="PayslipDetail"
          component={PayslipDetailScreen}
          options={{
            header: ({ navigation, scene, route }) => (
              <Header
                back
                white
                transparent
                // tabs={tabs.timeoffs}
                // tabIndex={tabs.timeoffs[1].id}
                title="Payslip Detail"
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

export default PayslipStack