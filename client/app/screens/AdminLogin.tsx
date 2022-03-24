import { useState, useEffect, useContext } from "react";
import { StackNativeScreenProps } from "../interfaces/StackParamList";

// Components
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapButton from "../components/MapButton";

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
  }

  // unmount error solution: https://stackoverflow.com/questions/58038008/how-to-stop-memory-leak-in-useeffect-hook-react
  useEffect(() => {
    let unmounted = false;
    if (!data) return;

    setAuth({
      isAuthenticated: true,
      userData: data,
    });

    if (data.user.requestPwdReset) {
      // navigate to reset password
      return;
    }

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
        <Text style={styles.UnPw}>Email</Text>
        <TextInput
          style={styles.txInput}
          keyboardType="email-address"
          placeholder="Email"
          value={email}
          onChangeText={(value) => setEmail(value)}
        />
      </View>

      <View style={styles.controlGroup}>
        <Text style={styles.UnPw}>Password</Text>
        <TextInput
          style={styles.txInput}
          maxLength={18}
          placeholder="Password"
          value={password}
          onChangeText={(value) => setPassword(value)}
          secureTextEntry
        />
      </View>
      <MapButton
        backgroundColor={"green"}
        handlePress={handleSignIn}
        label={"Sign in"}
      />
      {loading && <Text>Loading...</Text>}
      {error && (
        <>
          <Text style={styles.errText}>Error:</Text>
          <Text style={styles.errText}>{error}</Text>
        </>
      )}

      <MapButton
        handlePress={() => {
          alert(
            "You now see three more TextInputs in order to change your password."
          );
        }}
        label={"Update Password"}
        backgroundColor={"red"}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  controlGroup: {
    flexDirection: "row",
  },
  errText: {
    color: "red",
    fontWeight: "bold",
    padding: 10,
  },
  msg: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 50,
  },
  txInput: {
    borderWidth: 2,
    margin: 5,
    marginEnd: 125,
    fontSize: 20,
    fontWeight: "500",
    lineHeight: 30,
    flex: 3,
  },
  UnPw: {
    bottom: -10,
    fontSize: 20,
    fontWeight: "500",
  },
});
