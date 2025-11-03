import NextAuth, {
  NextAuthOptions,
  DefaultSession,
  Account,
  Profile,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";

// --- 1. Type Augmentation สำหรับ NextAuth ---
declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      provider?: string;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    provider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    provider?: string;
    healthId?: {
      account_id: string;
      name_th: string;
    };
    providerId?: {
      account_id: string;
      name_th: string;
    };
  }
}

// --- 2. Interfaces สำหรับ Profile Response ---
interface HealthIdProfileData {
  account_id: string;
  first_name_th: string;
  middle_name_th: string;
  last_name_th: string;
  first_name_eng: string;
  middle_name_eng: string;
  last_name_eng: string;
  account_title_th: string;
  account_title_eng: string;
  id_card_type: string;
  id_card_num: string;
  hash_id_card_num: string;
  account_sub_category: string;
  birth_date: string;
  mobile_number: string;
  gender_th: string;
  gender_eng: string;
}

interface HealthIdProfileResponse {
  status: string;
  data: HealthIdProfileData;
  message: string;
  status_code: number;
}

interface ProviderIdOrganization {
  business_id: string;
  position: string;
  hcode: string;
  hcode9: string;
  hname_th: string;
  hname_eng: string;
  tax_id: string;
  license_expired_date: string;
  expertise: string;
  is_hr_admin: boolean;
  is_director: boolean;
  position_type: string;
}

interface ProviderIdProfileData {
  account_id: string;
  name_th: string;
  name_eng: string;
  firstname_th: string;
  lastname_th: string;
  firstname_en: string;
  lastname_en: string;
  title_th: string | null;
  special_title_th: string;
  title_en: string | null;
  special_title_en: string;
  hash_cid: string;
  provider_id: string;
  ial_level: number;
  organization?: ProviderIdOrganization[];
}

interface ProviderIdProfileResponse {
  status: number;
  data: ProviderIdProfileData;
  message: string;
}

interface ProviderIdTokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  cid?: string;
  name_th?: string;
  name_eng?: string;
}

interface ProviderIdTokenResponse {
  status: string;
  data: ProviderIdTokenData;
  message: string;
  message_th: string;
  code: number;
}

interface HealthIdTokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  expiration_date: string;
  account_id: string;
}

interface HealthIdTokenResponse {
  status: string;
  data: HealthIdTokenData;
  message: string;
}

// --- 3. Custom Types สำหรับ NextAuth ---
interface HealthIdProfile extends Profile {
  status: string;
  data: HealthIdProfileData;
  message: string;
  status_code: number;
}

interface ProviderIdProfile extends Profile {
  status: number;
  data: ProviderIdProfileData;
  message: string;
}

interface OAuthRequestContext {
  provider: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };
  tokens: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
  };
}

// --- 4. การดึงและตรวจสอบ Environment Variables ---
const {
  HEALTHID_CLIENT_ID,
  HEALTHID_CLIENT_SECRET,
  PROVIDER_ID_CLIENT_ID,
  PROVIDER_ID_CLIENT_SECRET,
  NEXTAUTH_SECRET,
} = process.env;

if (!HEALTHID_CLIENT_ID) {
  throw new Error("Missing HEALTHID_CLIENT_ID environment variable");
}
if (!HEALTHID_CLIENT_SECRET) {
  throw new Error("Missing HEALTHID_CLIENT_SECRET environment variable");
}
if (!PROVIDER_ID_CLIENT_ID) {
  throw new Error("Missing PROVIDER_ID_CLIENT_ID environment variable");
}
if (!PROVIDER_ID_CLIENT_SECRET) {
  throw new Error("Missing PROVIDER_ID_CLIENT_SECRET environment variable");
}
if (!NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET environment variable");
}

const HEALTHID_UAT_URL = "https://uat-moph.id.th";
const PROVIDER_ID_UAT_URL = "https://uat-provider.id.th";

// --- 5. Helper Functions ---
const createBasicAuthHeader = (
  clientId: string,
  clientSecret: string
): string => {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );
  return `Basic ${credentials}`;
};

const handleApiError = async (
  response: Response,
  context: string
): Promise<never> => {
  const errorText = await response.text();
  throw new Error(`${context} failed: ${response.status} ${errorText}`);
};

// --- 6. การตั้งค่า authOptions หลัก ---
export const authOptions: NextAuthOptions = {
  providers: [
    // 1. Credentials Provider (Username/Password)
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        if (
          credentials.username === "admin" &&
          credentials.password === "password123"
        ) {
          return {
            id: "1",
            name: "Admin User",
            email: "admin@example.com",
            provider: "credentials",
          };
        }
        return null;
      },
    }),

    // 2. HealthID Provider (Custom OAuth)
    {
      id: "healthid",
      name: "Health ID",
      type: "oauth",
      clientId: HEALTHID_CLIENT_ID,
      clientSecret: HEALTHID_CLIENT_SECRET,
      authorization: {
        url: `${HEALTHID_UAT_URL}/oauth/redirect`,
        params: {
          response_type: "code",
        },
      },
      token: {
        url: `${HEALTHID_UAT_URL}/api/v1/token`,
        async request(context) {
          const { params } = context;

          if (!params.code) {
            throw new Error("Authorization code is missing");
          }

          const response = await fetch(`${HEALTHID_UAT_URL}/api/v1/token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              code: params.code,
              redirect_uri: context.provider.callbackUrl,
              client_id: HEALTHID_CLIENT_ID,
              client_secret: HEALTHID_CLIENT_SECRET,
            }),
          });

          if (!response.ok) {
            await handleApiError(response, "Health ID token request");
          }

          const tokens: HealthIdTokenResponse = await response.json();

          return {
            tokens: {
              access_token: tokens.data.access_token,
              token_type: tokens.data.token_type,
              expires_in: tokens.data.expires_in,
            },
          };
        },
      },
      userinfo: {
        url: `${HEALTHID_UAT_URL}/go-api/v1/profile`,
        async request(context: OAuthRequestContext) {
          const response = await fetch(
            `${HEALTHID_UAT_URL}/go-api/v1/profile`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${context.tokens.access_token}`,
              },
            }
          );

          if (!response.ok) {
            await handleApiError(response, "Health ID userinfo request");
          }

          const profile: HealthIdProfileResponse = await response.json();
          return profile;
        },
      },
      profile(profile: HealthIdProfile): Profile {
        return {
          id: profile.data.account_id,
          name: `${profile.data.first_name_th} ${profile.data.last_name_th}`,
          email: null,
          image: null,
        };
      },
      checks: ["pkce", "state"],
    },

    // 3. Provider ID Provider (Custom OAuth)
    {
      id: "provider-id",
      name: "Provider ID",
      type: "oauth",
      clientId: PROVIDER_ID_CLIENT_ID,
      clientSecret: PROVIDER_ID_CLIENT_SECRET,
      authorization: {
        url: `${PROVIDER_ID_UAT_URL}/v1/oauth2/authorize`,
        params: {
          response_type: "code",
          scope: "cid name_th name_eng email mobile_number",
        },
      },
      token: {
        url: `${PROVIDER_ID_UAT_URL}/v1/oauth2/token`,
        async request(context) {
          const { params } = context;

          if (!params.code) {
            throw new Error("Authorization code is missing");
          }

          const response = await fetch(
            `${PROVIDER_ID_UAT_URL}/v1/oauth2/token`,
            {
              method: "POST",
              headers: {
                Authorization: createBasicAuthHeader(
                  PROVIDER_ID_CLIENT_ID,
                  PROVIDER_ID_CLIENT_SECRET
                ),
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                grant_type: "authorization_code",
                code: params.code,
                redirect_uri: context.provider.callbackUrl,
              }),
            }
          );

          if (!response.ok) {
            await handleApiError(response, "Provider ID token request");
          }

          const tokens: ProviderIdTokenResponse = await response.json();

          return {
            tokens: {
              access_token: tokens.data.access_token,
              refresh_token: tokens.data.refresh_token,
              expires_in: tokens.data.expires_in,
              token_type: tokens.data.token_type,
              scope: tokens.data.scope,
            },
          };
        },
      },
      userinfo: {
        url: `${PROVIDER_ID_UAT_URL}/api/v1/services/profile`,
        async request(context: OAuthRequestContext) {
          const response = await fetch(
            `${PROVIDER_ID_UAT_URL}/api/v1/services/profile`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${context.tokens.access_token}`,
                "client-id": PROVIDER_ID_CLIENT_ID,
                "secret-key": PROVIDER_ID_CLIENT_SECRET,
              },
            }
          );

          if (!response.ok) {
            await handleApiError(response, "Provider ID profile request");
          }

          const profile: ProviderIdProfileResponse = await response.json();
          return profile;
        },
      },
      profile(profile: ProviderIdProfile): Profile {
        const name =
          profile.data.name_th ||
          `${profile.data.firstname_th} ${profile.data.lastname_th}`;

        return {
          id: profile.data.account_id,
          name: name,
          email: null,
          image: null,
        };
      },
      checks: ["pkce", "state"],
    },
  ],

  // --- 7. Session และ Callbacks ---
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({
      token,
      account,
      profile,
    }: {
      token: JWT;
      account: Account | null;
      profile?: Profile;
    }) {
      if (account) {
        token.provider = account.provider;

        if (account.provider === "healthid" && profile) {
          const healthIdProfile = profile as HealthIdProfile;
          token.healthId = {
            account_id: healthIdProfile.data.account_id,
            name_th: `${healthIdProfile.data.first_name_th} ${healthIdProfile.data.last_name_th}`,
          };
        } else if (account.provider === "provider-id" && profile) {
          const providerIdProfile = profile as ProviderIdProfile;
          token.providerId = {
            account_id: providerIdProfile.data.account_id,
            name_th:
              providerIdProfile.data.name_th ||
              `${providerIdProfile.data.firstname_th} ${providerIdProfile.data.lastname_th}`,
          };
        }
      }
      return token;
    },
    async session({ session, token }: { session: DefaultSession; token: JWT }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.provider = token.provider;
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },
  secret: NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
