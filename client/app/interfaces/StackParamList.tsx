// https://reactnavigation.org/docs/typescript -- Organizing types
// update per documentation if we need to do composite types (e.g. drawer or bottom navigation)
import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type StackStackParamList = {
  Home: undefined;
  Admin: undefined;
  "Trail Screen": undefined;
  "Point of Interest": undefined;
  "Get Photo": undefined;
};

export type StackNativeScreenProps<T extends keyof StackStackParamList> =
  NativeStackScreenProps<StackStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface StackParamList extends StackStackParamList {}
  }
}
