import { SetStateAction } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
  // render item
  const renderItem = (item: DataItem, key: number) => {
    const value = item?.value ?? item.label;
    let backgroundColor;
    let color;
    let border = {};

    if (value === selected) {
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
    // alignItems: "center",
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
});
