// lib/fetchCitySuggestions.ts

export interface CitySuggestion {
  display: string; // full display_name ไว้โชว์
  city: string; // “Bangkok” / “ดินแดง”
  province: string; // “Bangkok” / “กรุงเทพมหานคร”
  country: string; // “Thailand”
  lat: string;
  lon: string;
}

export async function fetchCitySuggestions(
  query: string
): Promise<CitySuggestion[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search` +
      `?format=json` +
      `&addressdetails=1` + // ✨ สำคัญ! ขอ field address
      `&accept-language=th,en` +
      `&q=${encodeURIComponent(query)}` +
      `&limit=8`
  );
  if (!res.ok) return [];

  const data = await res.json();

  return (
    data
      // 1) มี address ถึงจะใช้
      .filter((i: any) => !!i.address)
      // 3) map → สร้าง CitySuggestion อย่างปลอดภัย
      .map((i: any): CitySuggestion => {
        const cityName =
          i.address.city ||
          i.address.town ||
          i.address.village ||
          i.address.county ||
          i.address.state ||
          ""; // fallback

        return {
          display: i.display_name,
          city: cityName,
          province: i.address.state || i.address.county || "",
          country: i.address.country || "",
          lat: i.lat,
          lon: i.lon,
        };
      })
      // 4) คัดออกถ้า city ว่างจริง ๆ
      .filter((c: CitySuggestion) => c.city !== "")
  );
}
