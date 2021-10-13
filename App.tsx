import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import MapView, { Marker, AnimatedRegion, Polyline } from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';

export default function App() {
  // Default coordaninates upon loading (Camp Allen).
  const [location, setLocation] = useState({
    latitude: 30.24166,
    longitude: -95.95935,
    latitudeDelta: 0.003,
    longitudeDelta: 0.003,
  });
  const [errorMsg, setErrorMsg] = useState(null);

// Error message if current location isn't working.
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  let text = 'Waiting...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) { 
    text= '';
  }


  return (
    <View style={styles.container}>
      <MapView 
      style={styles.map}
      initialRegion={location}
      showsUserLocation={true}>

      </MapView>
      <StatusBar style="auto" />
      <Text style={styles.paragraph}>{text}</Text>

      <View style={styles.btnContainer}>
        <TouchableOpacity
          onPress= {() => alert('Yay! you can start mapping!')}
          style={[styles.mapBtn, { backgroundColor:'green' }]}>
          <Text style={styles.btnText}>Start Point</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress= {() => alert('Congratulations, you compleated a trail! ')}
          style={[styles.mapBtn, { backgroundColor:'red'}]}>
          <Text style={styles.btnText}>Stop Point</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress= {() => alert('You will now be able to rewalk this trail any time you want.')}
          style={[styles.mapBtn, {backgroundColor:'blue'}]}>
          <Text style={styles.btnText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  paragraph: {
    position: 'absolute', 
    top: 100,
    right: 30,
  },
  btnText:{
    fontSize: 20,
    color: '#fff',
  },
  btnContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    bottom: 0,
  },
  mapBtn:{
    marginVertical: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
});