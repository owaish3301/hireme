import { config } from "../../config/env.js";
import { OAuth2Client } from "google-auth-library";

const redirectURI = `${config.BASE_API_URL}/api/auth/google/callback`

export const googleAuthClient = new OAuth2Client({
    clientId : config.GOOGLE_CLIENT_ID,
    clientSecret : config.GOOGLE_CLIENT_SECRET,
    redirectUri : redirectURI,
})