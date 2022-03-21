import React from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface LoginButtonProps {
  onPress(): void;
}
export default function LoginButton({ onPress }: LoginButtonProps) {
  return (
    <Pressable onPress={onPress}>
      <Image source={require("./loginBtn.png")} style={styles.image} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 30,
    height: 30,
  },
});
