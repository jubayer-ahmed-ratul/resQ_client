// ResQFlow – static mock data only
// Future: replace with NEXT_PUBLIC_API_URL calls

export type Severity = "Critical" | "High" | "Medium" | "Low";
export type ResourceStatus = "Available" | "Assigned" | "En Route";

export interface Incident {
  id: string;
  priority: number;
  severity: Severity;
  location: string;
}

export interface Resource {
  id: string;
  type: string;
  status: ResourceStatus;
  eta?: string;
}

export interface Hospital {
  id: string;
  name: string;
  capacity: "Available" | "Limited" | "Full";
}

export const incidents: Incident[] = [
  { id: "Flood-102", priority: 92, severity: "Critical", location: "North District" },
  { id: "Fire-221",  priority: 78, severity: "High",     location: "Central District" },
  { id: "Medical-087", priority: 64, severity: "Medium", location: "East District" },
];

export const resources: Resource[] = [
  { id: "A-12", type: "Ambulance", status: "Available", eta: "8 min" },
  { id: "B-07", type: "Ambulance", status: "En Route",  eta: "14 min" },
  { id: "C-03", type: "Ambulance", status: "Assigned",  eta: "11 min" },
  { id: "FE-01", type: "Fire Engine", status: "Available", eta: "6 min" },
];

export const hospitals: Hospital[] = [
  { id: "CMC", name: "City Medical Center",   capacity: "Available" },
  { id: "GH",  name: "General Hospital",      capacity: "Limited" },
  { id: "NRC", name: "North Regional Clinic", capacity: "Available" },
];

export const dashboardStats = {
  activeIncidents: 24,
  availableUnits:  18,
  hospitalsReady:   7,
  avgResponseMin:   8,
};
