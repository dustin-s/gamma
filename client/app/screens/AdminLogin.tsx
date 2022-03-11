import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { BASE_API } from "../utils/constants";
import useFetch from "../utils/useFetch";

interface User {
  user: {
    userId: number;
    userName: string;
    email: string;
    isAdmin: boolean;
    requestPwdReset: boolean;
    lastPwdUpdate: Date;
    isActive: boolean;
    lastLogin: Date;
    createdAt: Date;
    updatedAt: Date;
  };
  token: string;
  message: string;
}

export default function AdminLogin() {
  // screen controls
  const [err, setErr] = useState<Error | string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  // form controls
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // // fetch information
  // const [url, setURL] = useState("");
  // const [requestOptions, setRequestOptions] = useState<RequestInit>({});

  const handleSignIn = async () => {
    // setRequestOptions
    const reqOpts: RequestInit = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Cache-control": "no-cache",
      },
      body: JSON.stringify({ email, password }),
    };
    // setURL
    const curURL = BASE_API + "users/login";

    console.log("requestOptions:", reqOpts, "\nURL:", curURL);

    // fetchURL updates on URL change
    try {
      setIsLoading(true);
      const response = await fetch(curURL, reqOpts);
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = await response.json();
      setIsLoading(false);
      console.log(data);

      // const { data, error } = useFetch<User>(curURL, reqOpts);
      // // const { data, error } = useFetch<User>(url, requestOptions);
      // if (error) {
      //   console.log(error);
      //   setThereISAnError(error);
      // }
      // if (!data) setIsLoading(true);
      // if (data) {
      //   console.log(data);
      // }

      // return;
    } catch (e: any) {
      console.log(e);
      setIsLoading(false);
      setErr(e);
    }
  };

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
      {isLoading && <Text>Loading...</Text>}
      {err && (
        <>
          <Text style={styles.errText}>Error:</Text>
          <Text style={styles.errText}>
            {typeof err === "string" ? err : JSON.stringify(err)}
          </Text>
        </>
      )}

      <TouchableOpacity onPress={() => {alert("You now see three more TextInputs inorder to change your password.")}}>
        <Text>Update Password</Text>
      </TouchableOpacity>
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
