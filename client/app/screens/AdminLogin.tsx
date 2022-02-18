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
  const [thereISAnError, setThereISAnError] = useState<
    Error | string | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);

  // form controls
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // fetch information
  const [url, setURL] = useState("");
  const [body, setBody] = useState<RequestInit>({});

  // fetchURL updates on URL change
  const { data, error } = useFetch<User>(url, body);
  if (error) setThereISAnError(error);
  if (!data) setIsLoading(true);
  if (data) {
    console.log(data);
  }

  const handleSignIn = async () => {
    setBody({ body: JSON.stringify({ email, password }) });
    setURL(BASE_API + "users/login");

    return;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.msg}>Maps can only be edited by Administers.</Text>

      <View style={styles.controlGroup}>
        <Text style={styles.UnPw}>Email</Text>
        <TextInput
          style={styles.txInput}
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
