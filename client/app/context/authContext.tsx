// stolen from: https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context
import React from "react";
import { User } from "../interfaces/User";

export interface Authentication {
  isAuthenticated: boolean;
  userData: User | null;
}

export function createCtx<A>(defaultValue: A) {
  type UpdateType = React.Dispatch<React.SetStateAction<typeof defaultValue>>;
  const defaultUpdate: UpdateType = () => defaultValue;
  const ctx = React.createContext({
    auth: defaultValue,
    setAuth: defaultUpdate,
  });

  function Provider(props: React.PropsWithChildren<{}>) {
    const [auth, setAuth] = React.useState(defaultValue);

    return <ctx.Provider value={{ auth, setAuth }} {...props} />;
  }

  return [ctx, Provider] as const; // alternatively, [typeof ctx, typeof Provider]
}

export const [ctx, AuthProvider] = createCtx<Authentication>({
  isAuthenticated: false,
  userData: null,
});
export const AuthContext = ctx;
