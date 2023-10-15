import { Platform } from "react-native";
import * as Location from "expo-location";
/**
 * Check the status on foreground permissions to use the mapping functionality.
 * If the user does not have permissions set, it will ask 1 time for permissions to be set.
 *
 * @returns <promise>true/false as long as the permissions are not none, returns true
 */
export const checkFGStatus = async () => {
  let granted = false;
  let timesAsked = 0;

  let status = await Location.getForegroundPermissionsAsync();

  do {
    const device = Platform.OS;
    if (device === "ios") {
      granted = status.ios?.scope !== "none";
    } else {
      granted = status.android?.accuracy != "none";
    }
    if (!granted && timesAsked < 1) {
      status = await Location.requestForegroundPermissionsAsync();
      timesAsked++;
    }
  } while (!granted && timesAsked < 1);
  return granted;
};
