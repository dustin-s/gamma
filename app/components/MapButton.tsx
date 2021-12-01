import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface MapButtonProps {
  label: string;
  backgroundColor: string;
  handlePress: () => void;
}

export default function MapButton({
  label,
  backgroundColor,
  handlePress,
}: MapButtonProps) {
  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.mapBtn, { backgroundColor: backgroundColor }]}
    >
      <Text style={styles.btnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btnText: {
    fontSize: 20,
    color: "#fff",
  },
  mapBtn: {
    marginVertical: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
});
