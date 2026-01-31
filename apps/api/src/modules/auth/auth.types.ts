export type PublicUser = {
  id: string;
  mobileNumber: string;
  name: string;
  createdAt: string;
};

export type AuthSuccess = {
  user: PublicUser;
  accessToken: string;
};
