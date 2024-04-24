import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CoursesList from "../../screens/App/Courses/CoursesList";
import CourseView from "../../screens/App/Courses/CourseView";
import LessonView from "../../screens/App/Courses/LessonView";
import { Header } from '../../components';

const Stack = createNativeStackNavigator();


function CoursesStack(props) {
    return (
      <Stack.Navigator
        screenOptions={{
          mode: "card",
          headerShown: true,
        }}
        initialRouteName="Courses"
      >
        <Stack.Screen
          name="Courses"
          component={CoursesList}
          options={{
            header: ({ navigation, scene, route }) => (
              <Header
                back
                white
                transparent
                // tabs={tabs.timeoffs}
                // tabIndex={tabs.timeoffs[1].id}
                title="Courses"
                navigation={navigation}
                route={route}
                scene={scene}
              />
            ),
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="CourseView"
          component={CourseView}
          options={{
            header: ({ navigation, scene, route }) => (
              <Header
                back
                white
                transparent
                // tabs={tabs.timeoffs}
                // tabIndex={tabs.timeoffs[1].id}
                title="Courses"
                navigation={navigation}
                route={route}
                scene={scene}
              />
            ),
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="LessonView"
          component={LessonView}
          options={{
            header: ({ navigation, scene, route }) => (
              <Header
                back
                white
                transparent
                // tabs={tabs.timeoffs}
                // tabIndex={tabs.timeoffs[1].id}
                title="Courses"
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

export default CoursesStack