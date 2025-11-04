import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client();

export const authClient = {
  useSession: async () => {
    const data = await auth0.getSession();
    return {
      data,
      isPending: data === null,
    }
  },
}