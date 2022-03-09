import { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { BASE_API } from "../utils/constants";
import useFetch from "../hooks/useFetch";
import { User } from "../interfaces/User";
import { AuthContext } from "../utils/authContext";

export default function AdminLogin() {
  // form controls
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Auth stuff...
  const { auth, setAuth } = useContext(AuthContext);

  // fetch information
  const { fetchData, data, error, loading } = useFetch<User>();

  const handleSignIn = async () => {
    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Cache-control": "no-cache",
      },
      body: JSON.stringify({ email, password }),
    };
    const url = BASE_API + "users/login";
    fetchData({ url, options });
  };

  useEffect(() => {
    if (!data) return;

    setAuth({
      isAuthenticated: true,
      userData: data,
    });

    if (data.user.requestPwdReset) {
      // navigate to reset password
      return;
    }

    // navigate to Trails?
  }, [data]);

  return (
    <View style={styles.container}>
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
      <TouchableOpacity onPress={handleSignIn}>
        <Text>Sign in</Text>
      </TouchableOpacity>
      {loading && <Text>Loading...</Text>}
      {error && (
        <>
          <Text style={styles.errText}>Error:</Text>
          <Text style={styles.errText}>{error}</Text>
        </>
      )}
    </View>
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
