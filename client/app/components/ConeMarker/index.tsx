import React, { useEffect } from "react";
import { Image } from "react-native";
import { LatLng, Marker } from "react-native-maps";

interface ConeMarkerProps {
  coords: LatLng;
}

export default function ConeMarker({ coords }: ConeMarkerProps) {
  useEffect(() => console.log("ConeMarker"), []);
  return (
    <Marker coordinate={coords}>
      <Image
        source={require("./cone.png")}
        style={{ height: 26 }}
        resizeMethod={"scale"}
        resizeMode="contain"
      />
    </Marker>
  );
}
