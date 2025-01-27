export interface InstitutionData {
  institution_identifier: string;
  latitude: string | null;
  longitude: string | null;
  libTypeUser: string | null;
  institutionName: string | null;
  City: string | null;
  State: string | null;
  Country: string | null;
  postalCd: string | null;
}

export interface ApiResponse {
  entries: Array<{
    content: {
      institution: {
        nameLocation: {
          mainAddress: {
            latitude: string;
            longitude: string;
            city: string;
            state: string;
            country: string;
            postalCd: string;
          };
          libTypeUser: string;
          institutionName: string;
        };
      };
    };
  }>;
}
