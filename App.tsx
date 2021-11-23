import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./app/screens/HomeScreen";
import EditScreen from "./app/screens/EditScreen";

// Screen Navigation
const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Choose a Trail" component={HomeScreen} />
        <Stack.Screen name="Edit Map" component={EditScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
