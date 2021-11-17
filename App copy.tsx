import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import MapView, { Marker, AnimatedRegion, Polyline } from "react-native-maps";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import MainScreen from "./mainScreen";
/* 
// name of the background task --- used for tracking the position (even if app is closed)
const LOCATION_TASK_NAME = "background-location-task";
 */

export default function App() {
  // Default coordaninates upon loading (Camp Allen).
  //   const [location, setLocation] = useState({
  //     latitude: 30.24166,
  //     longitude: -95.95935,
  //     latitudeDelta: 0.003,
  //     longitudeDelta: 0.003,
  //   });
  //   const [errorMsg, setErrorMsg] = useState(null);

  //   interface CurLocation {
  //     latitude: number;
  //     longitude: number;
  //     altitude?: number;
  //   }

  //   let curLocation: CurLocation = {
  //     latitude: 0,
  //     longitude: 0,
  //   };

  //   const startMapping = async () => {
  //     let curLocation = navigator.geolocation.watchPosition((position) => {
  //       const { latitude, longitude } = position.coords;
  //       curLocation.latitude = Number(latitude);
  //       curLocation.longitude = Number(longitude);
  //     });

  //     // let curLocation = await Location.getCurrentPositionAsync();
  //     console.log("\n\n------------\n\ncurLocation:\n", curLocation);
  //     alert(`Yay! you can start mapping!
  //             location: {
  //               latitude: ${curLocation.coords.latitude}
  //               longitude: ${curLocation.coords.longitude}
  //               altitude: ${curLocation.coords.altitude}
  //             }`);
  //   };

  //   // Error message if current location isn't working.
  //   /*  useEffect(() => {
  //     (async () => {
  //       let { status } = await Location.requestForegroundPermissionsAsync();
  //       if (status !== "granted") {
  //         setErrorMsg("Permission to access location was denied.");
  //         return;
  //       }

  //       let location = await Location.getCurrentPositionAsync({});
  //       setLocation(location);
  //     })();
  //   }, []);
  // */
  //   let text = "Waiting...";
  //   if (errorMsg) {
  //     text = errorMsg;
  //   } else if (location) {
  //     text = "";
  //   }

  //   console.log("location:", location);

  /* 
  type StyledMarkerProps = {
    label: string;
  };

  const StyledMarker = ({ label }: StyledMarkerProps) => (
    <View
      style={{
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#ffc600",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "black" }}>label</Text>
    </View>
  );
 */

  return <MainScreen />;
  //   <View style={styles.container}>
  //     <MapView
  //       style={styles.map}
  //       initialRegion={location}
  //       showsUserLocation={true}
  //     >
  //       <Marker
  //         coordinate={{
  //           latitude: location.latitude,
  //           longitude: location.latitude,
  //         }}
  //         title="test"
  //       >
  //         {/* <StyledMarker label="My Marker" /> */}
  //       </Marker>
  //     </MapView>
  //     <StatusBar style="auto" />
  //     <Text style={styles.paragraph}>{text}</Text>

  //     <View style={styles.btnContainer}>
  //       <TouchableOpacity
  //         style={[styles.mapBtn, { backgroundColor: "green" }]}
  //         onPress={startMapping}
  //       >
  //         <Text style={styles.btnText}>Start Point</Text>
  //       </TouchableOpacity>

  //       <TouchableOpacity
  //         onPress={() => alert("Congratulations, you compleated a trail! ")}
  //         style={[styles.mapBtn, { backgroundColor: "red" }]}
  //       >
  //         <Text style={styles.btnText}>Stop Point</Text>
  //       </TouchableOpacity>

  //       <TouchableOpacity
  //         onPress={() =>
  //           alert(
  //             "You will now be able to rewalk this trail any time you want."
  //           )
  //         }
  //         style={[styles.mapBtn, { backgroundColor: "blue" }]}
  //       >
  //         <Text style={styles.btnText}>Save</Text>
  //       </TouchableOpacity>
  //     </View>
  //   </View>
  // );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  paragraph: {
    position: "absolute",
    top: 100,
    right: 30,
  },
  btnText: {
    fontSize: 20,
    color: "#fff",
  },
  btnContainer: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-evenly",
    bottom: 0,
  },
  mapBtn: {
    marginVertical: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
});
