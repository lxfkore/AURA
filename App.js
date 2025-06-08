import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Startup from "./frontend/src/pages/Startup";
import Signup from "./frontend/src/pages/Signup";
import Login from "./frontend/src/pages/Login";
import Period from "./frontend/src/pages/Period";
import Community from "./frontend/src/pages/Community";
import Post from "./frontend/src/pages/Post";
import Business from "./frontend/src/pages/Business";
import Profile from "./frontend/src/pages/Profile";
import Calendar from "./frontend/src/pages/Calendar";
import MRecord from "./frontend/src/pages/MRecord";
import Pill from "./frontend/src/pages/Pill";
import FertilityMap from "./frontend/src/pages/FertilityMap";
import Tabs from "./frontend/src/pages/Tabs";
import { useFonts } from "expo-font";
import { OpenSans_700Bold } from "@expo-google-fonts/open-sans";
import { ActivityIndicator, View } from "react-native";

// ✅ Fix for crypto.getRandomValues() issue in uuid or GooglePlacesAutocomplete
import "expo-crypto";
if (typeof global.crypto === "undefined") {
  global.crypto = {
    getRandomValues: (array) => {
      const crypto = require("expo-crypto");
      const randomBytes = crypto.getRandomBytes(array.length);
      array.set(randomBytes);
      return array;
    },
  };
}

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    "OpenSans-Bold": OpenSans_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Startup" component={Startup} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Period" component={Period} />
        <Stack.Screen name="Community" component={Community} />
        <Stack.Screen name="Post" component={Post} />
        <Stack.Screen name="Business" component={Business} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Calendar" component={Calendar} />
        <Stack.Screen name="MRecord" component={MRecord} />
        <Stack.Screen name="Pill" component={Pill} />
        <Stack.Screen name="FertilityMap" component={FertilityMap} />
        <Stack.Screen name="Tabs" component={Tabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
