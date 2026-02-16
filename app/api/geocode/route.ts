import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { street, postalCode, cityName, latitude, longitude } = await req.json()

  // Handle Reverse Geocoding (latitude, longitude to address)
  if (latitude !== undefined && longitude !== undefined) {
    try {
      // Use OpenStreetMap Nominatim for real reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "EcontDeliveryApp/1.0",
          },
        },
      )

      if (!response.ok) {
        throw new Error("Geocoding service unavailable")
      }

      const data = await response.json()

      if (data && data.address) {
        const address = data.address
        const street = address.road || address.pedestrian || address.path || ""
        const houseNumber = address.house_number || ""
        const city = address.city || address.town || address.village || address.municipality || ""
        const postcode = address.postcode || ""
        const country = address.country || "България"

        // Construct full address
        let fullAddress = ""
        if (street) {
          fullAddress += street
          if (houseNumber) {
            fullAddress += ` ${houseNumber}`
          }
        }
        if (city) {
          if (fullAddress) fullAddress += ", "
          fullAddress += city
        }
        if (postcode) {
          fullAddress += ` ${postcode}`
        }
        if (country) {
          fullAddress += `, ${country}`
        }

        return NextResponse.json({
          city: city,
          postalCode: postcode,
          street: street,
          streetNumber: houseNumber,
          fullAddress: fullAddress,
          latitude: latitude,
          longitude: longitude,
        })
      } else {
        return NextResponse.json({ error: "Address not found for these coordinates" }, { status: 404 })
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error)
      return NextResponse.json({ error: "Geocoding service error" }, { status: 500 })
    }
  }

  // Handle Forward Geocoding (address to latitude, longitude)
  if (!street || !cityName) {
    return NextResponse.json({ error: "Street and city name are required for geocoding." }, { status: 400 })
  }

  try {
    // Use OpenStreetMap Nominatim for real forward geocoding
    const query = `${street}, ${cityName}, Bulgaria`
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
      {
        headers: {
          "User-Agent": "EcontDeliveryApp/1.0",
        },
      },
    )

    if (!response.ok) {
      throw new Error("Geocoding service unavailable")
    }

    const data = await response.json()

    if (data && data.length > 0) {
      const result = data[0]
      return NextResponse.json({
        latitude: Number.parseFloat(result.lat),
        longitude: Number.parseFloat(result.lon),
      })
    } else {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Forward geocoding error:", error)
    return NextResponse.json({ error: "Geocoding service error" }, { status: 500 })
  }
}
