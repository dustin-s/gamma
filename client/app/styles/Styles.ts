//This is a Global StyleSheet.
//It holds the main styling aspects for consistent styling.
import {
  StyleSheet,
  Dimensions,
  Platform,
  useWindowDimensions,
} from "react-native";

const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    margin: 10,
    width: "100%",
  },

  container: {
    backgroundColor: "#98002D",
    flex: 1,
    flexDirection: "column",
  },

  controlGroup: {
    flexDirection: "row",
  },

  errText: {
    color: "#f1b265",
    fontWeight: "bold",
    padding: 10,
  },

  fgContainer: {
    alignItems: "center",
    bottom: 40,
    // todo: figure out the proper way to account for header
    flex: 1,
    justifyContent: "flex-end",
    position: "absolute",
    width: "100%",
  },

  image: {
    width: 30,
    height: 30,
  },

  loginBtnContainer: {
    position: "absolute",
    right: 10,
    top: Platform.OS === "ios" ? 40 : 110,
    elevation: 3, // for Android
    zIndex: 3, // for iOS
  },

  map: {
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
  },

  mapKey: {
    width: Dimensions.get("window").width,
    height: Platform.OS === "ios" ? 125 : 110,
  },

  mapKeyContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 0 : 0,
  },

  msg: {
    color: "#f1b265",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 50,
    textAlign: "center",
    top: -20,
  },

  permissionsText: {
    color: "red",
    fontSize: 24,
    padding: 10,
    textAlign: "center",
  },

  safeAreaView: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },

  txInput: {
    backgroundColor: "#750023",
    borderColor: "#f1b265",
    borderRadius: 20,
    borderWidth: 2,
    color: "#f9e4c7",
    direction: "rtl",
    flex: 3,
    fontSize: 20,
    fontWeight: "500",
    lineHeight: 30,
    margin: 5,
    overflow: "hidden",
    paddingHorizontal: 18,
    paddingVertical: 6,
  },

  unPw: {
    bottom: -14,
    color: "#f1b265",
    fontSize: 20,
    fontWeight: "500",
    margin: 5,
  },
});

export default styles;
