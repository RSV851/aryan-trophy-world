import { NextRequest } from "next/server";
import { db } from "@/db";
import { adminProfile } from "@/db/schema";
import { updateAdminProfileSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { eq } from "drizzle-orm";

// GET /api/v1/admin/profile - Get business owner profile
export async function GET() {
  try {
    const [profile] = await db.select().from(adminProfile).limit(1);

    if (!profile) {
      return errorResponse("Admin profile not found", 404);
    }

    return successResponse(profile, "Admin profile retrieved successfully");
  } catch (error: any) {
    return errorResponse("Failed to fetch admin profile", 500, error.message);
  }
}

// PUT /api/v1/admin/profile - Update business owner profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = updateAdminProfileSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const data = parsed.data;
    const [existing] = await db.select().from(adminProfile).limit(1);

    if (!existing) {
      // Create profile if not present
      const [newProfile] = await db
        .insert(adminProfile)
        .values({
          name: data.name,
          email: data.email,
          phone: data.phone,
          businessName: data.businessName,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          avatarUrl: data.avatarUrl,
          bio: data.bio,
        })
        .returning();

      return successResponse(newProfile, "Admin profile created successfully", 201);
    }

    // Update existing profile
    const [updatedProfile] = await db
      .update(adminProfile)
      .set({
        name: data.name,
        email: data.email,
        phone: data.phone,
        businessName: data.businessName,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        avatarUrl: data.avatarUrl,
        bio: data.bio,
        updatedAt: new Date(),
      })
      .where(eq(adminProfile.id, existing.id))
      .returning();

    return successResponse(updatedProfile, "Admin profile updated successfully");
  } catch (error: any) {
    return errorResponse("Failed to update admin profile", 500, error.message);
  }
}
