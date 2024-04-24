import React from "react";
import SettingScreen from "../../screens/App/Settings/SettingsScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PasswordScreen from "../../screens/App/Settings/PasswordScreen";
import DeleteAccountScreen from "../../screens/App/Settings/DeleteAccountScreen";
import ProfileScreen from "../../screens/App/Settings/ProfileScreen";
import { Header } from "../../components";

function SettingsStack() {
    const Stack = createNativeStackNavigator();

    return (
        <Stack.Navigator
            screenOptions={{
                mode: "card",
                headerShown: false,
            }}
        >
            <Stack.Screen
                component={SettingScreen}
                options={{
                    headerShown:true,
                    header: ({ navigation, scene }) => (
                      <Header
                        // search
                        // options
                        back
                        transparent={false}
                        // white
                        title="Settings"
                        navigation={navigation}
                        scene={scene}
                      />
                    ),
                    headerTransparent: false,
                  }}
                name="SettingScreen"
            />
            <Stack.Screen
                option={{
                    headerTransparent: true,
                }}
                name="Profile"
                options={{ headerShown: true }}
                component={ProfileScreen}
            />
            <Stack.Screen
                option={{
                    headerTransparent: true,
                }}
                name="Password"
                options={{ headerShown: true }}
                component={PasswordScreen}
            />
            <Stack.Screen
                option={{
                    headerTransparent: true,
                }}
                name="DeleteAccount"
                options={{ headerShown: true }}
                component={DeleteAccountScreen}
            />
        </Stack.Navigator>
    );
}

export default SettingsStack;
