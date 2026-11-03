export interface Airport {
  code: string;
  name: string;
}

export interface CompanyFlight {
  pid: string;
  cs: string;
  type: string;
  reg: string;
  t0: number;
  from: Airport;
  to: Airport;
  eta: number;
}

export interface Holding {
  v: number;
  lat: number;
  lon: number;
}

export interface CompanyMember {
  cs: string;
  rank: string;
  joined?: number;
  jobs?: number;
  earned?: number;
  seen?: number;
  at?: string;
  gave?: number;
  brought?: number;
}

export interface Company {
  id: string;
  name: string;
  tag: string;
  treasury: number;
  members: Record<string, CompanyMember>;
  fleet: Array<{ reg: string; type: string; at: Airport | null }>;
  bases: Array<{ code: string; name: string; gates: number }>;
  log: Array<{ t: number; text: string }>;
  stats: { jobs: number; units: number; earned: number };
}

export interface CareerResponse {
  career?: { co?: string; money?: number };
  company?: Company;
}

export interface AirResponse {
  now?: number;
  flights?: CompanyFlight[];
  held?: Record<string, Holding>;
}