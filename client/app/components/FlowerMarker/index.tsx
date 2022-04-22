import React, { useEffect } from "react";
import { Image } from "react-native";
import { LatLng, Marker } from "react-native-maps";

interface FlowerMarkerProps {
  coords: LatLng;
}

export default function FlowerMarker({ coords }: FlowerMarkerProps) {
  useEffect(() => console.log("FlowerMarker"), []);
  return (
    <Marker coordinate={coords}>
      <Image
        source={require("./flower.png")}
        style={{ width: 26, height: 26 }}
        resizeMode="contain"
      />
    </Marker>
  );
}
