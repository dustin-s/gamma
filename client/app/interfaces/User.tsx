export interface User {
  user: {
    userId: number;
    userName: string;
    email: string;
    isAdmin: boolean;
    requestPwdReset: boolean;
    lastPwdUpdate: Date;
    isActive: boolean;
    lastLogin: Date;
    createdAt: Date;
    updatedAt: Date;
  };
  token: string;
  message: string;
}
