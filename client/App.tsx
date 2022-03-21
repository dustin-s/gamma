import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StackParamList } from "./app/interfaces/StackParamList";

// Authentication Context
import { AuthProvider } from "./app/utils/authContext";

// Screens
import HomeScreen from "./app/screens/HomeScreen";
import AdminLogin from "./app/screens/AdminLogin";
import PointOfInterest from "./app/screens/PointOfInterest";
import GetPhoto from "./app/screens/GetPhoto";
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
              headerTintColor: "#fff",
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
            <Stack.Screen name="Admin" component={AdminLogin} />
            <Stack.Screen
              name="Point of Interest"
              component={PointOfInterest}
            />
            <Stack.Screen name="Get Photo" component={GetPhoto} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

export default App;
