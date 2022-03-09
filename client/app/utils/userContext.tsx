// stolen from: https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context
import React from "react";
import { User } from "../interfaces/User";

export function createCtx<A>(defaultValue: A) {
  type UpdateType = React.Dispatch<React.SetStateAction<typeof defaultValue>>;
  const defaultUpdate: UpdateType = () => defaultValue;
  const ctx = React.createContext({
    state: defaultValue,
    update: defaultUpdate,
  });

  function Provider(props: React.PropsWithChildren<{}>) {
    const [state, update] = React.useState(defaultValue);

    return <ctx.Provider value={{ state, update }} {...props} />;
  }

  return [ctx, Provider] as const; // alternatively, [typeof ctx, typeof Provider]
}

interface Authentication {
  isAuthenticated: boolean;
  userData: User | null;
}

export const [ctx, AuthProvider] = createCtx<Authentication>({
  isAuthenticated: false,
  userData: null,
});
export const AuthContext = ctx;
