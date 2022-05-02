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
  const [getNewPassword, setGetNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

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

  //Confirm and update password
  async function handleUpdatePassword() {

      const updatePassword = {
        userId : data?.user.userId,
        oldPassword : password,
        newPassword,
        confirmPassword,
      }
    if (newPassword === confirmPassword ){  
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
    } else {alert("Passwords do not match, please try again.")};
  };

//Change Password Button
  function changeBtn() {
    setGetNewPassword(true);
  }; 

//Do we need this? 
//I had to add a function to show getNewPassword with a button
//Seems to override useEffect 
  // unmount error solution: https://stackoverflow.com/questions/58038008/how-to-stop-memory-leak-in-useeffect-hook-react
 useEffect (() => {

    let unmounted = false;
    if (!data) return;

    setAuth({
      isAuthenticated: true,
      userData: data,
    });

    if (data.user.requestPwdReset) {
      // show reset password
      setGetNewPassword (true);
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
        <Text style={styles.unPw}>Email</Text>
        <TextInput
          style={styles.txInput}
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor="#ff7670"
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
          placeholderTextColor="#ff7670"
          value={password}
          onChangeText={(value) => setPassword(value)}
          secureTextEntry
        />
      </View>
      <MapButton
        backgroundColor={"#ff8c00"}
        handlePress={handleSignIn}
        label={"Sign in"}
      />

<MapButton
        backgroundColor={"#ff8c00"}
        handlePress={changeBtn}
        label={"Change Password"}
      />
      {loading && <Text>Loading...</Text>}
      {error && (
        <>
          <Text style={styles.errText}>Error:</Text>
          <Text style={styles.errText}>{error}</Text>
        </>
      )}

      {getNewPassword &&  (<View>
      <View style={styles.controlGroup}>
        <Text style={styles.unPw}>New Password</Text>
        <TextInput
          style={styles.txInput}
          maxLength={18}
          placeholder=" New Password"
          placeholderTextColor="#ff7670"
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
          placeholderTextColor="#ff7670"
          value={confirmPassword}
          onChangeText={(value) => setConfirmPassword(value)}
          secureTextEntry
        />
      </View>
      <MapButton
      label ={"Summit"}
      backgroundColor = {"blue"}
      handlePress = {handleUpdatePassword}/>
      </View>)}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#98002D",
  },
  controlGroup: {
    flexDirection: "row",
  },
  errText: {
    color: "white",
    fontWeight: "bold",
    padding: 10,
  },
  msg: {
    textAlign: "center",
    top: -20,
    color: "#ff8c00",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 50,
  },
  txInput: {
    borderColor: "#b63b3b",
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
    bottom: -17,
    color: "#ff7670",
    fontSize: 20,
    fontWeight: "500",
  },
});
