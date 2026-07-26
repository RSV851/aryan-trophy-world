import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /api/v1/auth/session
 * Returns the current authenticated admin's session info.
 * Uses getClaims() — JWT-validated, safe for server-side use.
 * Returns 401 if no valid session exists.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // getClaims() validates the JWT — safe to trust on the server
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: data.claims.sub,
          email: data.claims.email,
          role: data.claims.role,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
