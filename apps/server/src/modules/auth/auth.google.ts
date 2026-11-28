import { OAuth2Client } from "google-auth-library";

export const makeAuthClient = ({
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  BASE_API_URL,
}: {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BASE_API_URL: string;
}) => {
  return {
    googleAuthClient: new OAuth2Client({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      redirectUri: `${BASE_API_URL}/api/auth/google/callback`,
    }),
  };
};

export type AuthClient = ReturnType<typeof makeAuthClient>;
