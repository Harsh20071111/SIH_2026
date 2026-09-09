export type OfficerRank = 
  | "DutyOfficer"
  | "IO"
  | "SHO"
  | "SP"
  | "ForensicExpert"
  | "Magistrate"
  | "Admin"
  | "Auditor";

export interface UserJurisdiction {
  policeStationId: string;
  districtCode: string;
  stateCode: string;
  jurisdictionId: string;
}

export interface SecurityClearance {
  level: number;
  tags: string[];
}
