import { SetStateAction } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
// circle image from https://www.pinclipart.com/downpngs/ibRwwR_drawn-circle-white-png-hand-drawn-circle-png/
import circleImage from "./circle.png";

interface DataItem {
  label: string;
  colorSelected: string;
  colorNotSelected?: string;
  textColorSelected: string;
  textColorNotSelected?: string;
  value?: string;
}

interface SlideSelectorProps {
  selected: string;
  onSelect(value: SetStateAction<unknown>): void;
  data: DataItem[];
}

export default function SlideSelector({
  selected,
  onSelect,
  data,
}: SlideSelectorProps) {
  const renderItem = (item: DataItem, key: number) => {
    const value = item?.value ?? item.label;
    const isSelected = value === selected;
    let backgroundColor;
    let color;
    let border = {};

    if (isSelected) {
      backgroundColor = item.colorSelected;
      color = item.textColorSelected;
      border = { borderColor: "black", borderWidth: 2 };
    } else {
      backgroundColor = item?.colorNotSelected ?? "#f9c2ff";
      color = item?.textColorNotSelected ?? "black";
    }

    return (
      <Pressable
        onPress={() => onSelect(value)}
        style={[styles.item, { backgroundColor }, border]}
        key={key}
      >
        <Text style={[styles.title, { color }]}>{item.label}</Text>
        {isSelected && (
          <View style={styles.imageContainer}>
            <Image source={circleImage} style={styles.circle} />
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {data.map((item, index) => renderItem(item, index))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  item: {
    padding: 10,
    flex: 1,
    flexBasis: 0,
  },
  title: {
    textAlign: "center",
    fontSize: 20,
  },
  imageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
