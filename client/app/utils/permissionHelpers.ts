import { Platform } from "react-native";
import { LocationPermissionResponse } from "expo-location";

/**
 * Check the status on permissions to use the mapping functionality
 *
 * @param status - the Location Permission Response object to be tested
 * @returns true/false as long as the permissions are not none, returns true
 */
export const checkStatus = (status: LocationPermissionResponse | null) => {
  if (!status) {
    return false;
  }
  const device = Platform.OS;
  if (device === "ios") {
    return status.ios?.scope !== "none";
  } else {
    return status.android?.accuracy != "none";
  }
};
