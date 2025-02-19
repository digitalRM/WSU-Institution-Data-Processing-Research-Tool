"use server";

import axios from "axios";
import { InstitutionData, ApiResponse } from "@/types/institution";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function mapLibraryType(libTypeUser: string): string {
  const typeMap: { [key: string]: string } = {
    "1": "Academic",
    "2": "Academic",
    "3": "Public & School (K-12)",
    "4": "Public & School (K-12)",
    "5": "Other",
    "15": "Other",
    "7": "Other",
    "29": "Other",
    "30": "Other",
    "32": "Other",
    "33": "Other",
    "999": "Other",
    "6": "Government, State & National",
    "8": "Government, State & National",
    "11": "Vendor",
    "13": "Museums & Archives",
    "14": "Museums & Archives",
    "31": "Museums & Archives",
    "16": "Special",
    "17": "Special",
    "18": "Special",
    "19": "Special",
    "20": "Special",
    "21": "Special",
    "22": "Special",
    "23": "Special",
    "24": "Special",
    "25": "Special",
    "26": "Special",
  };

  return typeMap[libTypeUser] || "Unknown";
}

export async function fetchInstitutionData(
  inst: string,
  bearerToken: string
): Promise<Partial<InstitutionData>> {
  const maxRetries = 3;
  let currentRetry = 0;
  let waitTime = 100;

  while (currentRetry < maxRetries) {
    try {
      await delay(waitTime);

      const response = await axios.get<ApiResponse>(
        `https://worldcat.org/oclc-config/institution/search?q=local.oclcSymbol:${encodeURIComponent(
          inst
        )}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${bearerToken}`,
          },
        }
      );

      // Create default data with "NoneFound" for all fields
      const data = {
        latitude: "NoneFound",
        longitude: "NoneFound",
        libTypeUser: "NoneFound",
        libraryType: "Unknown",
        institutionName: "NoneFound",
        City: "NoneFound",
        State: "NoneFound",
        Country: "NoneFound",
        postalCd: "NoneFound",
      };

      // Only try to get entry data if it exists
      const entry =
        response.data?.entries?.[0]?.content?.institution?.nameLocation;

      if (entry) {
        data.latitude = entry.mainAddress?.latitude ?? "NoneFound";
        data.longitude = entry.mainAddress?.longitude ?? "NoneFound";
        data.libTypeUser = entry.libTypeUser ?? "NoneFound";
        data.libraryType = entry.libTypeUser
          ? mapLibraryType(entry.libTypeUser)
          : "Unknown";
        data.institutionName = entry.institutionName ?? "NoneFound";
        data.City = entry.mainAddress?.city ?? "NoneFound";
        data.State = entry.mainAddress?.state ?? "NoneFound";
        data.Country = entry.mainAddress?.country ?? "NoneFound";
        data.postalCd = entry.mainAddress?.postalCd ?? "NoneFound";
      }

      return data;
    } catch (error) {
      console.error("Error fetching institution data:", error);
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        console.error("Response data:", errorData);

        // Handle rate limiting (429)
        if (error.response?.status === 429) {
          currentRetry++;
          if (currentRetry < maxRetries) {
            console.log(
              `Rate limited. Retrying in ${waitTime / 1000} seconds...`
            );
            waitTime *= 2; // Exponential backoff
            continue;
          }
        }

        // Check for specific authentication errors
        if (error.response?.status === 401) {
          const errorMessage =
            typeof errorData === "string"
              ? errorData
              : errorData?.message ||
                "Authentication failed. Please check your token.";
          throw new Error(errorMessage);
        }
      }

      // If we've exhausted retries or it's not a 429 error, return NoneFound values
      return {
        latitude: "NoneFound",
        longitude: "NoneFound",
        libTypeUser: "NoneFound",
        libraryType: "Unknown",
        institutionName: "NoneFound",
        City: "NoneFound",
        State: "NoneFound",
        Country: "NoneFound",
        postalCd: "NoneFound",
      };
    }
  }

  // If we've exhausted all retries
  return {
    latitude: "NoneFound",
    longitude: "NoneFound",
    libTypeUser: "NoneFound",
    libraryType: "Unknown",
    institutionName: "NoneFound",
    City: "NoneFound",
    State: "NoneFound",
    Country: "NoneFound",
    postalCd: "NoneFound",
  };
}
