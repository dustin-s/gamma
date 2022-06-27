import { useState, useEffect, useContext } from "react";
import { StackNativeScreenProps } from "../interfaces/StackParamList";

// Components
import {
  Text,
  View,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapButton from "../components/MapButton";
import styles from "../components/Styles";

// Hooks
import useFetch from "../hooks/useFetch";
import { AuthContext } from "../utils/authContext";

// Types
import { User } from "../interfaces/User";
type Props = StackNativeScreenProps<"Admin">;

export default function AdminLogin({ navigation }: Props) {
  // form controls
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Auth stuff...
  const { auth, setAuth } = useContext(AuthContext);

  // fetch information
  const { fetchData, data, error, loading } = useFetch<User>();

  async function handleSignIn() {
    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Cache-control": "no-cache",
      },
      body: JSON.stringify({ email, password }),
    };
    const url = "users/login";
    fetchData({ url, options });
  };

  // unmount error solution: https://stackoverflow.com/questions/58038008/how-to-stop-memory-leak-in-useeffect-hook-react
 useEffect (() => {

    let unmounted = false;
    if (!data) return;

    setAuth({
      isAuthenticated: true,
      userData: data,
    });

    // returns to calling screen
    navigation.goBack();

    return () => {
      unmounted = true;
    };
  }, [data]);
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.msg}>Maps can only be edited by Administers.</Text>

      <View style={styles.controlGroup}>
        <Text style={styles.unPw}>Email</Text>
        <TextInput
          style={styles.txInput}
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor="#f1b265"
          value={email}
          onChangeText={(value) => setEmail(value)}
        />
      </View>

      <View style={styles.controlGroup}>
        <Text style={styles.unPw}>Password</Text>
        <TextInput
          style={styles.txInput}
          maxLength={18}
          placeholder="Password"
          placeholderTextColor="#f1b265"
          value={password}
          onChangeText={(value) => setPassword(value)}
          secureTextEntry
        />
      </View>
      <View style = {styles.btnContainer}>
        <MapButton
          label={"Sign in"}
          backgroundColor={"#f1b265"}
          handlePress={handleSignIn}
         />
      </View>

      {loading && <Text>Loading...</Text>}
      {error && (
        <>
          <Text style={styles.errText}>Error:</Text>
          <Text style={styles.errText}>{error}</Text>
        </>
      )}
    </SafeAreaView>
  );
}