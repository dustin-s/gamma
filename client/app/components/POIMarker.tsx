// arrow functionality of the custom marker came from: https://www.youtube.com/watch?v=4N-8RTeQ1fA&ab_channel=PradipDebnath

import { ImageBackground, StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import { POIObj } from "../interfaces/POIObj";
import { BASE_URL } from "../utils/constants";
import { StackNativeScreenProps } from "../interfaces/StackParamList";

interface POIMarkerProps {
  poi: POIObj;
}

export default function POIMarker({ poi }: POIMarkerProps) {
  const navigation =
    useNavigation<StackNativeScreenProps<"Point of Interest">["navigation"]>();

  const handleOnPress = () => {
    navigation.navigate("Point of Interest", { poi });
  };

  const parseCoord = (coord: unknown): number => {
    if (typeof coord === "number") {
      return coord;
    }
    if (typeof coord === "string") {
      return parseFloat(coord);
    } else {
      throw `Coord: ${coord} is not a number. It is a ${typeof coord}`;
    }
  };

  return (
    <Marker
      coordinate={{
        latitude: parseCoord(poi.latitude),
        longitude: parseCoord(poi.longitude),
      }}
      onPress={handleOnPress}
    >
      <View>
        <ImageBackground
          source={{
            uri: BASE_URL + poi.image,
          }}
          style={styles.image}
        />
        <View style={styles.arrow} />
      </View>
    </Marker>
  );
}

const TEXT_COLOR = "brown";
const styles = StyleSheet.create({
  image: {
    height: 40,
    width: 40,
    resizeMode: "contain",
    borderRadius: 26,
    overflow: "hidden",
    borderColor: TEXT_COLOR,
    borderWidth: 2,
    marginTop: 4,
    marginBottom: -1,
  },

  arrow: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderTopColor: TEXT_COLOR,
    borderWidth: 8,
    alignSelf: "center",
  },
});
