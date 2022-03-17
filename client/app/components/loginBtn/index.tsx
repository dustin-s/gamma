import React from "react";
import { Image, Platform, Pressable, StyleSheet, View } from "react-native";

interface LoginButtonProps {
  onPress(): void;
}
export default function LoginButton({ onPress }: LoginButtonProps) {
  return (
    <View style={styles.btnContainer}>
      <Pressable onPress={onPress}>
        <Image source={require("./Settings.png")} style={styles.image} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  btnContainer: {
    position: "absolute",
    // flexDirection: "row",
    right: 10,
    top: Platform.OS === "ios" ? 35 : 50,
  },
  image: {
    width: 30,
    height: 30,
  },
});
