import { useState, useEffect, useContext } from "react";
import { StackNativeScreenProps } from "../interfaces/StackParamList";

// Components
import { StyleSheet, Text, View, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapButton from "../components/MapButton";

// Hooks
import useFetch from "../hooks/useFetch";
import { AuthContext } from "../utils/authContext";

// Types
import { User } from "../interfaces/User";
import { checkFGStatus } from "../utils/permissionHelpers";
type Props = StackNativeScreenProps<"Admin">;

export default function AdminLogin({ navigation }: Props) {
  // const [statusFG, requestFGPermission] = Location.useForegroundPermissions();
  // form controls
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Auth stuff...
  const { setAuth } = useContext(AuthContext);

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

  const dealWithData = async () => {
    if (data) {
      let fgStatus = await checkFGStatus(); // use as model for bgStatus

      setAuth({
        isAuthenticated: true,
        userData: data,
        fgPermissions: fgStatus,
      });

      // returns to calling screen
      navigation.goBack();
    }
  };

  // unmount error solution: https://stackoverflow.com/questions/58038008/how-to-stop-memory-leak-in-useeffect-hook-react
  useEffect(() => {
    let unmounted = false;

    if (!data) return;
    dealWithData();

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
      <View style={styles.btnContainer}>
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
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#98002D",
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    margin: 10,
  },

  controlGroup: {
    flexDirection: "row",
  },

  errText: {
    color: "#f1b265",
    fontWeight: "bold",
    padding: 10,
  },

  msg: {
    textAlign: "center",
    top: -20,
    color: "#f1b265",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 50,
  },

  txInput: {
    borderColor: "#f1b265",
    backgroundColor: "#750023",
    color: "#f9e4c7",
    borderWidth: 2,
    borderRadius: 20,
    margin: 5,
    marginEnd: 125,
    paddingHorizontal: 18,
    paddingVertical: 6,
    fontSize: 20,
    fontWeight: "500",
    lineHeight: 30,
    flex: 3,
  },

  unPw: {
    bottom: -14,
    margin: 5,
    color: "#f1b265",
    fontSize: 20,
    fontWeight: "500",
  },
});
