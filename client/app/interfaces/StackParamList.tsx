// https://reactnavigation.org/docs/typescript -- Organizing types
// update per documentation if we need to do composite types (e.g. drawer or bottom navigation)
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LocationObject } from "expo-location";

export type StackParamList = {
  Home: undefined;
  Admin: undefined;
  "Trail Screen": /*{ trailID: number } |*/ undefined;
  "Point of Interest": {} | undefined;
  "Get Photo": undefined;
};

export type StackNativeScreenProps<T extends keyof StackParamList> =
  NativeStackScreenProps<StackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface ParamList extends StackParamList {}
  }
}
