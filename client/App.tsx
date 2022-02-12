import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// Screens
import HomeScreen from "./app/screens/HomeScreen";
import EditScreen from "./app/screens/EditScreen";
import AdminLogin from "./app/screens/AdminLogin";

// Screen Navigation
const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#98002D',
             },
          headerTintColor: '#fff',
        }}>
        
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false}}/>
        <Stack.Screen name="Admin" component={AdminLogin}/>
        <Stack.Screen name="Edit Map" component={EditScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
