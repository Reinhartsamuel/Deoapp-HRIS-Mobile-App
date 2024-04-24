import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnboardingScreen from "../screens/Authentication/Onboarding";
import AppStack from "./stacks/AppStack";

const Stack = createNativeStackNavigator();


export default function OnboardingStack(props) {
  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        option={{
          headerTransparent: true,
        }}
      />
      <Stack.Screen name="App" component={AppStack} />
    </Stack.Navigator>
  );
}
