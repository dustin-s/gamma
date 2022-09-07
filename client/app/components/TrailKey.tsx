import React from "react";
import { Image} from "react-native";
import styles from "../styles/Styles";

export default function TrailKey() {
  return (
   
      <Image source={require('../styles/trailKey.png')} style={[styles.mapKey]} />
    
  );
}