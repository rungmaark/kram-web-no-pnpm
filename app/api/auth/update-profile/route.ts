// app/api/auth/update-profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { normalizeStatus } from "@/lib/normalizeStatus";
import { makeLocationTokens } from "@/lib/utils/locations";
import { encrypt } from "@/lib/encrypt";

function sanitizeInterests(
  raw: any
): { interestName: string; category: string }[] {
  if (!Array.isArray(raw)) return [];

  const filtered = raw
    .filter(
      (i) =>
        typeof i?.interestName === "string" &&
        i.interestName.trim() !== "" &&
        typeof i?.category === "string" &&
        i.category.trim() !== ""
    )
    .map((i) => ({
      interestName: i.interestName.trim(),
      category: i.category.trim(),
    }));

  const seen = new Set<string>();
  return filtered.filter((i) => {
    if (seen.has(i.interestName)) return false;
    seen.add(i.interestName);
    return true;
  });
}

export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const {
      userId,
      displayName,
      gender,
      bio,
      profileImage,
      instagram,
      facebook,
      twitter,
      linkedin,
      currentCity,
      province,
      country,
      lat,
      lon,
      MBTI,
      relationshipStatus,
      interests: rawInterests,
      careers: rawCareers,
      birthYear,
      rawProfileText,
    } = body;

    if (!userId)
      return NextResponse.json(
        { error: "You are not logged in" },
        { status: 400 }
      );

    if (displayName === "")
      return NextResponse.json(
        { error: "Please enter your Display name" },
        { status: 400 }
      );

    const interestsDraft = sanitizeInterests(rawInterests);

    const cleanCity = currentCity?.trim() || null;

    function normalizeText(str: string | null | undefined) {
      return typeof str === "string" ? str.normalize("NFC").trim() : "";
    }

    const normalizedCity = normalizeText(cleanCity);

    const updatePayload: any = {
      displayName,
      gender,
      bio,
      profileImage,
      instagram,
      facebook,
      twitter,
      linkedin,
      currentCity: currentCity?.trim() || null,
      province: province?.trim() || null,
      country: country?.trim() || null,
      MBTI,
      relationshipStatus: normalizeStatus(relationshipStatus),
      birthYear: typeof birthYear === "number" ? birthYear : null,
    };

    if (!lat || !lon) updatePayload.$unset = { location: "" };

    if (lat && lon && !isNaN(+lat) && !isNaN(+lon)) {
      updatePayload.location = {
        type: "Point",
        coordinates: [parseFloat(lon), parseFloat(lat)], // [lon, lat]
      };
    }

    if (cleanCity !== null) updatePayload.currentCity = cleanCity;
    updatePayload.locationTokens = makeLocationTokens(cleanCity);

    if (rawInterests && interestsDraft.length > 0) {
      updatePayload.interests = interestsDraft;
    }

    if (
      typeof rawProfileText === "string" &&
      rawProfileText.trim().length > 0
    ) {
      updatePayload.rawProfileText = encrypt(rawProfileText.trim());
    }

    if (rawCareers && Array.isArray(rawCareers)) {
      const cleanCareers = [
        ...new Set(
          rawCareers.filter((c) => typeof c === "string" && c.trim() !== "")
        ),
      ];
      updatePayload.careers = cleanCareers;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatePayload, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "data" in err &&
      typeof (err as any).data === "object"
    ) {
      console.error("update-profile error:", (err as any).data);
    } else {
      console.error("update-profile unknown error:", err);
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
