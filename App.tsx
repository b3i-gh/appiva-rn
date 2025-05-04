import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "./src/screens/HomeScreen";
import YearScreen from "./src/screens/YearScreen";
import ExpenseScreen from "./src/screens/ExpenseScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const Tabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName = "home";

        if (route.name === "Current Month") iconName = "calendar";
        else if (route.name === "Year Recap") iconName = "stats-chart";
        else if (route.name === "Expense Coverage") iconName = "globe";
        else if (route.name === "Settings") iconName = "settings";

        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#2196f3",
      tabBarInactiveTintColor: "gray",
    })}
  >
    <Tab.Screen name="Current Month" component={HomeScreen} />
    <Tab.Screen name="Year Recap" component={YearScreen} />
    <Tab.Screen name="Expense Coverage" component={ExpenseScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={Tabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
