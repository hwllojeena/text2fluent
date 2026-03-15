import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { SupabaseAdapter } from "@auth/supabase-adapter"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { supabase } = await import('@/utils/supabase');
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data.user) {
          // Throwing an error will display the message on the frontend (handled by result.error)
          throw new Error(error?.message || 'Invalid credentials');
        }

        return {
          id: data.user.id,
          name: data.user.email?.split('@')[0] || '',
          email: data.user.email,
        };
      }
    })
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    secret: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "", // RLS is disabled so anon key works for server-to-db adapter as well
  }),
  pages: {
    signIn: '/',
  },
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        // Because of the adapter, the database user object is passed as `user`
        // We inject the database UUID to the session for frontend usage.
        (session.user as any).id = user?.id || token?.sub;
      }
      return session
    },
  },
  session: {
    strategy: "jwt", // Use JWT since we might not have a database fallback for the credentials provider
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev",
  debug: process.env.NODE_ENV === 'development',
})

export { handler as GET, handler as POST }
