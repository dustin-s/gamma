import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Authentication Context
import { AuthProvider } from "./app/utils/authContext";

// Screens
import HomeScreen from "./app/screens/HomeScreen";
import AdminLogin from "./app/screens/AdminLogin";
import PointOfInterest from "./app/screens/PointOfInterest";
import GetPhoto from "./app/screens/GetPhoto";
import TrailScreen from "./app/screens/TrailScreen";

// Screen Navigation
const Stack = createNativeStackNavigator();

function App() {
  return (
    <AuthProvider>
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
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Admin" component={AdminLogin} />
          <Stack.Screen name="Trail Screen" component={TrailScreen} />
          <Stack.Screen name="Point of Interest" component={PointOfInterest} />
          <Stack.Screen name="Get Photo" component={GetPhoto} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

export default App;
