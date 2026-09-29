export type VenueVisualIdentity =
  | "azure-dragon"
  | "white-tiger"
  | "nine-tailed-fox"
  | "red-phoenix";

export interface VenueSeed {
  id: string;
  name: string;
  visualIdentity: VenueVisualIdentity;
  visualLabel: string;
}

export const venueSeeds: VenueSeed[] = [
  {
    id: "theater",
    name: "โรงละคร",
    visualIdentity: "azure-dragon",
    visualLabel: "Azure Dragon",
  },
  {
    id: "faculty-building",
    name: "ตึกคณะ",
    visualIdentity: "white-tiger",
    visualLabel: "White Tiger",
  },
  {
    id: "weaving-building",
    name: "โรงทอ",
    visualIdentity: "nine-tailed-fox",
    visualLabel: "Nine-Tailed Fox",
  },
  {
    id: "sc3",
    name: "ตึก SC3",
    visualIdentity: "red-phoenix",
    visualLabel: "Red Phoenix",
  },
];
