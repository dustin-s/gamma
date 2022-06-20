import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StackParamList } from "./app/interfaces/StackParamList";

// Authentication Context
import { AuthProvider } from "./app/utils/authContext";

// Screens
import HomeScreen from "./app/screens/HomeScreen";
import AdminLogin from "./app/screens/AdminLogin";
import UpdatePassword from "./app/screens/UpdatePassword";
import PointOfInterest from "./app/screens/PointOfInterest";
import TrailScreen from "./app/screens/TrailScreen";

// Screen Navigation
const Stack = createNativeStackNavigator<StackParamList>();

function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: "#98002D",
              },
              headerTintColor: "#f1b265",
            }}
          >
            <Stack.Screen
              name="Trail Screen"
              component={TrailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Admin" 
              component={AdminLogin} 
              options={{
                title: 'Admin Login',
                headerTitleStyle: {
                  fontSize: 30,
                  fontWeight: "700",
                },}}/>
            <Stack.Screen 
              name="Update Password" 
              component={UpdatePassword} 
              options={{
              headerTitleStyle: {
                fontSize: 30,
                fontWeight: "700",
              }}}/>
            <Stack.Screen
              name="Point of Interest"
              component={PointOfInterest}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

export default App;
