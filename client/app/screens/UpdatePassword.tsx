import { useState, useEffect, useContext } from "react";
import { StackNativeScreenProps } from "../interfaces/StackParamList";

import { Text, View, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapButton from "../components/MapButton";
import styles from "../styles/Styles";

import useFetch from "../hooks/useFetch";
import { AuthContext } from "../contexts/authContext";

import { User } from "../interfaces/User";
type Props = StackNativeScreenProps<"Update Password">;

export default function UpdatePassword({ navigation }: Props) {
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { auth, setAuth } = useContext(AuthContext);

  const { fetchData, data, error, loading } = useFetch<User>();

  async function handleUpdatePassword() {
    const updatePassword = {
      userId: auth.userData?.user.userId,
      oldPassword: password,
      newPassword,
      confirmPassword,
    };
    if (newPassword === confirmPassword) {
      const options = {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Cache-control": "no-cache",
        },
        body: JSON.stringify(updatePassword),
      };
      const url = "users/update";
      fetchData({ url, options });
    } else {
      alert("Passwords do not match, please try again.");
    }
  }

  useEffect(() => {
    let unmounted = false;
    if (!data) return;

    setAuth({
      ...auth,
      isAuthenticated: true,
      userData: data,
    });

    navigation.goBack();

    return () => {
      unmounted = true;
    };
  }, [data]);

  function logout() {
    setAuth({ ...auth, isAuthenticated: false, userData: null });

    navigation.goBack();
  }
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.msg}>Maps can only be edited by Administers.</Text>

      <View style={styles.controlGroup}>
        <Text style={styles.unPw}>Email</Text>
        <Text style={styles.txInput}>{auth.userData?.user.email}</Text>
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

      <View style={styles.controlGroup}>
        <Text style={styles.unPw}>New Password</Text>
        <TextInput
          style={styles.txInput}
          maxLength={18}
          placeholder=" New Password"
          placeholderTextColor="#f1b265"
          value={newPassword}
          onChangeText={(value) => setNewPassword(value)}
          secureTextEntry
        />
      </View>
      <View style={styles.controlGroup}>
        <Text style={styles.unPw}>Confirm Password</Text>
        <TextInput
          style={styles.txInput}
          maxLength={18}
          placeholder="Confirm Password"
          placeholderTextColor="#f1b265"
          value={confirmPassword}
          onChangeText={(value) => setConfirmPassword(value)}
          secureTextEntry
        />
      </View>
      <View style={styles.btnContainer}>
        <MapButton
          label={"Submit"}
          backgroundColor={"#f1b265"}
          handlePress={() => handleUpdatePassword()}
        />
      </View>
      <View style={styles.btnContainer}>
        <MapButton
          label={"Logout"}
          backgroundColor={"#750023"}
          handlePress={() => logout()}
        />
      </View>

      {loading && <Text>Loading...</Text>}
      {error && (
        <>
          <Text style={styles.errText}>Error:</Text>
          <Text style={styles.errText}>
            {typeof error === "string" ? error : error.message}
          </Text>
        </>
      )}
    </SafeAreaView>
  );
}
