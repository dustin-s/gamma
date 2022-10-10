import { useContext } from "react";
import { AuthContext } from "../contexts/authContext";
import { checkFGStatus } from "../utils/permissionHelpers";

export const useAuthentication = () => {
  const { auth, setAuth } = useContext(AuthContext);

  const { isAuthenticated, userData, fgPermissions } = auth;

  const userId = userData?.user.userId || null;

  const getToken = () => {
    const token = auth.userData?.token;
    if (!token) {
      throw Error("User not authorized");
    }
    return token;
  };

  // everyone needs foreground permissions
  // background permission are not requested based on comment made by "byCedric"
  //  on Oct 18, 2021 in https://github.com/expo/expo/issues/14774
  const setFGStatus = async () => {
    const status = await checkFGStatus();
    await setAuth({ ...auth, fgPermissions: status });
  };

  return {
    fgPermissions,
    setFGStatus,
    isAuthenticated,
    userId,
    getToken,
  };
};
