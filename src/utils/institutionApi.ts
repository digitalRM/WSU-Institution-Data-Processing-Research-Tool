"use server";

import axios from "axios";
import { InstitutionData, ApiResponse } from "@/types/institution";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchInstitutionData(
  inst: string,
  bearerToken: string
): Promise<Partial<InstitutionData>> {
  await delay(50); // 50ms delay between requests

  try {
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
    // Return "NoneFound" for all fields in case of error
    return {
      latitude: "NoneFound",
      longitude: "NoneFound",
      libTypeUser: "NoneFound",
      institutionName: "NoneFound",
      City: "NoneFound",
      State: "NoneFound",
      Country: "NoneFound",
      postalCd: "NoneFound",
    };
  }
}
