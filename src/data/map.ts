// Full 1901 Diplomacy board: provinces, adjacencies, ownership, supply centers
// and starting forces. Coordinates are hand-tuned for a borderless "node map".

export type PowerId =
  | "ENG"
  | "FRA"
  | "GER"
  | "ITA"
  | "AUS"
  | "RUS"
  | "TUR"
  | "NEU";

export type UnitType = "A" | "F";

export interface PowerInfo {
  id: PowerId;
  name: string;
  color: string;
  monogram: string;
  blurb: string;
}

export interface Province {
  id: string; // abbreviation shown on the map
  name: string; // full name
  kind: "land" | "sea";
  /** Provinces reachable by an army from this province. */
  armyAdj: string[];
  /** Locations reachable by a fleet from this province or coast. */
  fleetAdj: string[];
  /** True only for Switzerland, which cannot contain or be traversed by a unit. */
  impassable?: boolean;
  /** supply-centre status */
  supply?: "home" | "neutral";
  /** initial territorial owner (display tint) */
  owner?: PowerId;
  x: number;
  y: number;
  /** optional ellipse radii overrides for seas */
  rx?: number;
  ry?: number;
}

export interface CoastLocation {
  id: string;
  province: string;
  name: string;
  fleetAdj: string[];
  x: number;
  y: number;
}

export const POWERS: PowerInfo[] = [
  { id: "ENG", name: "England", color: "#2b5faf", monogram: "E", blurb: "Two fleets, one army — rule the waves before landing on the continent." },
  { id: "FRA", name: "France", color: "#c2447c", monogram: "F", blurb: "A balanced start with Mediterranean reach and rich neighbours." },
  { id: "GER", name: "Germany", color: "#3f4653", monogram: "G", blurb: "Three strong centres — but surrounded by rivals on every frontier." },
  { id: "ITA", name: "Italy", color: "#3d8b4f", monogram: "I", blurb: "The Alpine wall guards your back; the Mediterranean calls." },
  { id: "AUS", name: "Austria-Hungary", color: "#b03a2e", monogram: "A", blurb: "The powder keg of the Balkans — strike fast or be carved up." },
  { id: "RUS", name: "Russia", color: "#6d4b8f", monogram: "R", blurb: "Vast, and the only power to field four units from the start." },
  { id: "TUR", name: "Turkey", color: "#c96a1e", monogram: "T", blurb: "Guard the straits, seize the Balkans, command the east." },
  { id: "NEU", name: "Neutral", color: "#9b9178", monogram: "·", blurb: "Contested by no power — for now." },
];

export const POWER_MAP: Record<PowerId, PowerInfo> = Object.fromEntries(
  POWERS.map((p) => [p.id, p]),
) as Record<PowerId, PowerInfo>;

export const GREAT_POWERS: PowerId[] = ["ENG", "FRA", "GER", "ITA", "AUS", "RUS", "TUR"];

export const WIN_CENTERS = 18; // supply centres needed to win

export const HOME_SUPPLY: Record<Exclude<PowerId, "NEU">, string[]> = {
  ENG: ["LON", "LVP", "EDI"],
  FRA: ["PAR", "BRE", "MAR"],
  GER: ["BER", "KIE", "MUN"],
  ITA: ["ROM", "VEN", "NAP"],
  AUS: ["VIE", "BUD", "TRI"],
  RUS: ["MOS", "STP", "SEV", "WAR"],
  TUR: ["CON", "ANK", "SMY"],
};

export const PROVINCES: Province[] = [
  // ---------------- AUSTRIA-HUNGARY ----------------
  { id: "VIE", name: "Vienna", kind: "land", supply: "home", owner: "AUS", x: 540, y: 571, armyAdj: ["BUD", "GAL", "BOH", "TYR", "TRI"], fleetAdj: [] },
  { id: "BUD", name: "Budapest", kind: "land", supply: "home", owner: "AUS", x: 571, y: 596, armyAdj: ["VIE", "GAL", "RUM", "SER", "TRI"], fleetAdj: [] },
  { id: "TRI", name: "Trieste", kind: "land", supply: "home", owner: "AUS", x: 534, y: 627, armyAdj: ["VIE", "BUD", "TYR", "VEN"], fleetAdj: ["VEN", "ADR"] },
  { id: "GAL", name: "Galicia", kind: "land", owner: "AUS", x: 592, y: 551, armyAdj: ["VIE", "BUD", "SIL", "WAR", "UKR", "RUM"], fleetAdj: [] },
  { id: "BOH", name: "Bohemia", kind: "land", owner: "AUS", x: 517, y: 527, armyAdj: ["VIE", "MUN", "SIL", "TYR", "GAL"], fleetAdj: [] },
  { id: "TYR", name: "Tyrolia", kind: "land", owner: "AUS", x: 492, y: 571, armyAdj: ["VIE", "TRI", "BOH", "MUN", "PIE", "VEN"], fleetAdj: [] },

  // ---------------- ENGLAND ----------------
  { id: "LON", name: "London", kind: "land", supply: "home", owner: "ENG", x: 346, y: 481, armyAdj: ["LVP", "YOR", "WAL"], fleetAdj: ["LVP", "YOR", "WAL", "ENC", "NTH"] },
  { id: "LVP", name: "Liverpool", kind: "land", supply: "home", owner: "ENG", x: 284, y: 429, armyAdj: ["EDI", "YOR", "LON", "WAL"], fleetAdj: ["EDI", "YOR", "LON", "WAL", "IRI", "NTH"] },
  { id: "EDI", name: "Edinburgh", kind: "land", supply: "home", owner: "ENG", x: 303, y: 395, armyAdj: ["LVP", "YOR"], fleetAdj: ["LVP", "YOR", "NWG", "NTH"] },
  { id: "YOR", name: "Yorkshire", kind: "land", owner: "ENG", x: 321, y: 453, armyAdj: ["EDI", "LON", "WAL", "LVP"], fleetAdj: ["EDI", "LON", "WAL", "NTH", "LVP"] },
  { id: "WAL", name: "Wales", kind: "land", owner: "ENG", x: 298, y: 508, armyAdj: ["LVP", "LON"], fleetAdj: ["LVP", "LON", "IRI", "ENC"] },

  // ---------------- FRANCE ----------------
  { id: "PAR", name: "Paris", kind: "land", supply: "home", owner: "FRA", x: 359, y: 573, armyAdj: ["PIC", "BUR", "GAS"], fleetAdj: [] },
  { id: "BRE", name: "Brest", kind: "land", supply: "home", owner: "FRA", x: 303, y: 559, armyAdj: ["PIC", "PAR", "GAS"], fleetAdj: ["PIC", "GAS", "ENC", "MAO"] },
  { id: "MAR", name: "Marseilles", kind: "land", supply: "home", owner: "FRA", x: 400, y: 629, armyAdj: ["BUR", "PIE", "SPA"], fleetAdj: ["PIE", "SPA", "GOL"] },
  { id: "PIC", name: "Picardy", kind: "land", owner: "FRA", x: 354, y: 531, armyAdj: ["BRE", "PAR", "BEL"], fleetAdj: ["BRE", "BEL", "ENC"] },
  { id: "BUR", name: "Burgundy", kind: "land", owner: "FRA", x: 395, y: 562, armyAdj: ["PAR", "MAR", "GAS", "PIE", "RUH", "MUN", "PIC"], fleetAdj: [] },
  { id: "GAS", name: "Gascony", kind: "land", owner: "FRA", x: 335, y: 624, armyAdj: ["BRE", "PAR", "BUR", "SPA"], fleetAdj: ["BRE", "SPA", "MAO"] },

  // ---------------- GERMANY ----------------
  { id: "BER", name: "Berlin", kind: "land", supply: "home", owner: "GER", x: 477, y: 455, armyAdj: ["MUN", "SIL", "KIE", "PRU"], fleetAdj: ["KIE", "PRU", "BAL"] },
  { id: "KIE", name: "Kiel", kind: "land", supply: "home", owner: "GER", x: 445, y: 450, armyAdj: ["MUN", "RUH", "BER", "DEN", "HOL"], fleetAdj: ["BER", "BAL", "HEL", "DEN", "HOL"] },
  { id: "MUN", name: "Munich", kind: "land", supply: "home", owner: "GER", x: 443, y: 555, armyAdj: ["BER", "SIL", "BOH", "TYR", "BUR", "RUH", "KIE"], fleetAdj: [] },
  { id: "RUH", name: "Ruhr", kind: "land", owner: "GER", x: 421, y: 512, armyAdj: ["MUN", "KIE", "BEL", "HOL", "BUR"], fleetAdj: [] },
  { id: "SIL", name: "Silesia", kind: "land", owner: "GER", x: 539, y: 503, armyAdj: ["MUN", "BER", "PRU", "WAR", "BOH", "GAL"], fleetAdj: [] },

  // ---------------- ITALY ----------------
  { id: "ROM", name: "Rome", kind: "land", supply: "home", owner: "ITA", x: 482, y: 654, armyAdj: ["TUS", "NAP", "APU", "VEN"], fleetAdj: ["TUS", "NAP", "APU", "VEN"] },
  { id: "VEN", name: "Venice", kind: "land", supply: "home", owner: "ITA", x: 478, y: 611, armyAdj: ["PIE", "TUS", "APU", "TYR", "TRI"], fleetAdj: ["PIE", "TUS", "APU", "TRI", "ADR"] },
  { id: "NAP", name: "Naples", kind: "land", supply: "home", owner: "ITA", x: 514, y: 683, armyAdj: ["ROM", "APU"], fleetAdj: ["ROM", "APU", "ION", "TYS"] },
  { id: "PIE", name: "Piedmont", kind: "land", owner: "ITA", x: 429, y: 615, armyAdj: ["MAR", "BUR", "VEN", "TYR", "TUS"], fleetAdj: ["MAR", "VEN", "GOL", "TUS"] },
  { id: "TUS", name: "Tuscany", kind: "land", owner: "ITA", x: 453, y: 625, armyAdj: ["ROM", "VEN", "PIE"], fleetAdj: ["ROM", "VEN", "PIE", "TYS", "GOL"] },
  { id: "APU", name: "Apulia", kind: "land", owner: "ITA", x: 525, y: 662, armyAdj: ["VEN", "ROM", "NAP"], fleetAdj: ["VEN", "ROM", "NAP", "ION", "ADR"] },

  // ---------------- RUSSIA ----------------
  { id: "MOS", name: "Moscow", kind: "land", supply: "home", owner: "RUS", x: 741, y: 441, armyAdj: ["SEV", "WAR", "UKR", "LIV", "STP"], fleetAdj: [] },
  { id: "STP", name: "St. Petersburg", kind: "land", supply: "home", owner: "RUS", x: 729, y: 301, armyAdj: ["FIN", "LIV", "MOS", "NOR"], fleetAdj: ["FIN", "BAR", "LIV", "NOR"] },
  { id: "SEV", name: "Sevastopol", kind: "land", supply: "home", owner: "RUS", x: 731, y: 595, armyAdj: ["MOS", "UKR", "RUM", "ARM"], fleetAdj: ["RUM", "BLA"] },
  { id: "WAR", name: "Warsaw", kind: "land", supply: "home", owner: "RUS", x: 621, y: 485, armyAdj: ["MOS", "UKR", "GAL", "SIL", "PRU"], fleetAdj: [] },
  { id: "UKR", name: "Ukraine", kind: "land", owner: "RUS", x: 680, y: 515, armyAdj: ["MOS", "WAR", "GAL", "RUM", "SEV"], fleetAdj: [] },
  { id: "LIV", name: "Livonia", kind: "land", owner: "RUS", x: 596, y: 400, armyAdj: ["MOS", "PRU", "STP", "WAR"], fleetAdj: ["PRU", "BAL", "STP"] },
  { id: "FIN", name: "Finland", kind: "land", owner: "RUS", x: 598, y: 298, armyAdj: ["STP", "SWE", "NOR"], fleetAdj: ["STP", "SWE", "NOR", "BAR"] },

  // ---------------- TURKEY ----------------
  { id: "CON", name: "Constantinople", kind: "land", supply: "home", owner: "TUR", x: 656, y: 697, armyAdj: ["ANK", "SMY", "BUL"], fleetAdj: ["ANK", "SMY", "BLA", "AEG", "BUL"] },
  { id: "ANK", name: "Ankara", kind: "land", supply: "home", owner: "TUR", x: 731, y: 666, armyAdj: ["CON", "SMY", "ARM"], fleetAdj: ["CON", "SMY", "BLA"] },
  { id: "SMY", name: "Smyrna", kind: "land", supply: "home", owner: "TUR", x: 696, y: 729, armyAdj: ["CON", "ANK", "ARM", "SYR"], fleetAdj: ["CON", "ANK", "SYR", "AEG", "EAS"] },
  { id: "ARM", name: "Armenia", kind: "land", owner: "TUR", x: 826, y: 651, armyAdj: ["ANK", "SMY", "SEV", "SYR"], fleetAdj: [] },
  { id: "SYR", name: "Syria", kind: "land", owner: "TUR", x: 759, y: 753, armyAdj: ["SMY", "ARM"], fleetAdj: ["SMY", "EAS"] },

  // ---------------- NEUTRAL SUPPLY CENTRES ----------------
  { id: "BEL", name: "Belgium", kind: "land", supply: "neutral", owner: "NEU", x: 381, y: 509, armyAdj: ["PIC", "BUR", "RUH", "HOL"], fleetAdj: ["PIC", "HOL", "ENC", "NTH"] },
  { id: "HOL", name: "Holland", kind: "land", supply: "neutral", owner: "NEU", x: 397, y: 484, armyAdj: ["RUH", "BEL", "KIE"], fleetAdj: ["BEL", "KIE", "HEL", "NTH"] },
  { id: "DEN", name: "Denmark", kind: "land", supply: "neutral", owner: "NEU", x: 445, y: 417, armyAdj: ["KIE", "SWE", "NOR"], fleetAdj: ["KIE", "SWE", "NOR", "SKG", "HEL", "BAL"] },
  { id: "NOR", name: "Norway", kind: "land", supply: "neutral", owner: "NEU", x: 409, y: 333, armyAdj: ["SWE", "FIN", "STP"], fleetAdj: ["NWG", "SWE", "FIN", "BAR", "SKG", "NTH", "STP"] },
  { id: "SWE", name: "Sweden", kind: "land", supply: "neutral", owner: "NEU", x: 530, y: 340, armyAdj: ["DEN", "NOR", "FIN"], fleetAdj: ["DEN", "NOR", "FIN", "BAL", "SKG"] },
  { id: "SPA", name: "Spain", kind: "land", supply: "neutral", owner: "NEU", x: 305, y: 666, armyAdj: ["POR", "GAS", "MAR"], fleetAdj: ["POR", "GAS", "MAR", "MAO", "WES", "GOL"] },
  { id: "POR", name: "Portugal", kind: "land", supply: "neutral", owner: "NEU", x: 246, y: 709, armyAdj: ["SPA"], fleetAdj: ["SPA", "MAO"] },
  { id: "GRE", name: "Greece", kind: "land", supply: "neutral", owner: "NEU", x: 583, y: 700, armyAdj: ["SER", "BUL", "ALB"], fleetAdj: ["AEG", "ION", "BUL", "ALB"] },
  { id: "SER", name: "Serbia", kind: "land", supply: "neutral", owner: "NEU", x: 584, y: 649, armyAdj: ["BUD", "RUM", "GRE", "ALB", "BUL", "TRI"], fleetAdj: [] },
  { id: "RUM", name: "Romania", kind: "land", supply: "neutral", owner: "NEU", x: 655, y: 616, armyAdj: ["BUD", "GAL", "UKR", "SEV", "BUL", "SER"], fleetAdj: ["SEV", "BLA", "BUL"] },
  { id: "BUL", name: "Bulgaria", kind: "land", supply: "neutral", owner: "NEU", x: 619, y: 648, armyAdj: ["CON", "GRE", "SER", "RUM"], fleetAdj: ["CON", "GRE", "RUM", "BLA", "AEG"] },
  { id: "TUN", name: "Tunisia", kind: "land", supply: "neutral", owner: "NEU", x: 455, y: 753, armyAdj: [], fleetAdj: ["WES", "TYS", "ION", "EAS"] },

  { id: "PRU", name: "Prussia", kind: "land", owner: "GER", x: 564, y: 449, armyAdj: ["BER", "SIL", "WAR", "LIV"], fleetAdj: ["BER", "LIV", "BAL"] },

  // ---------------- NEUTRAL (non-supply) ----------------
  { id: "ALB", name: "Albania", kind: "land", owner: "NEU", x: 564, y: 668, armyAdj: ["GRE", "SER", "TRI"], fleetAdj: ["GRE", "ION", "ADR", "TRI"] },
  { id: "SWI", name: "Switzerland", kind: "land", owner: "NEU", impassable: true, x: 595, y: 545, armyAdj: ["MUN", "TYR", "BUR", "PIE"], fleetAdj: [] },
  { id: "NAF", name: "North Africa", kind: "land", owner: "NEU", x: 302, y: 765, armyAdj: ["TUN"], fleetAdj: ["MAO", "WES", "TUN"] },

  // ---------------- SEAS ----------------
  { id: "ADR", name: "Adriatic Sea", kind: "sea", x: 510, y: 632, rx: 38, ry: 17, armyAdj: [], fleetAdj: ["VEN", "TRI", "ALB", "ION", "APU"] },
  { id: "AEG", name: "Aegean Sea", kind: "sea", x: 629, y: 724, rx: 38, ry: 17, armyAdj: [], fleetAdj: ["GRE", "ION", "EAS", "SMY", "CON", "BUL"] },
  { id: "NAO", name: "Atlantic Ocean", kind: "sea", x: 106, y: 359, rx: 70, ry: 42, armyAdj: [], fleetAdj: ["POR", "IRI", "NWG", "MAO", "NTH"] },
  { id: "BAL", name: "Baltic Sea", kind: "sea", x: 526, y: 417, rx: 42, ry: 19, armyAdj: [], fleetAdj: ["BER", "PRU", "LIV", "SWE", "DEN", "KIE"] },
  { id: "BAR", name: "Barents Sea", kind: "sea", x: 850, y: 42, rx: 60, ry: 36, armyAdj: [], fleetAdj: ["NOR", "FIN", "STP", "NWG"] },
  { id: "EAS", name: "Eastern Med.", kind: "sea", x: 651, y: 771, rx: 46, ry: 22, armyAdj: [], fleetAdj: ["ION", "AEG", "SMY", "SYR"] },
  { id: "ENC", name: "English Channel", kind: "sea", x: 334, y: 516, rx: 36, ry: 16, armyAdj: [], fleetAdj: ["NTH", "IRI", "LON", "WAL", "BEL", "PIC", "BRE", "MAO", "NAO"] },
  { id: "GOL", name: "Gulf of Lyon", kind: "sea", x: 389, y: 665, rx: 40, ry: 18, armyAdj: [], fleetAdj: ["SPA", "PIE", "MAR", "TUS", "TYS", "WES"] },
  { id: "HEL", name: "Heligoland Bight", kind: "sea", x: 411, y: 442, rx: 34, ry: 15, armyAdj: [], fleetAdj: ["NTH", "HOL", "KIE", "DEN"] },
  { id: "ION", name: "Ionian Sea", kind: "sea", x: 558, y: 767, rx: 44, ry: 20, armyAdj: [], fleetAdj: ["TUN", "NAP", "APU", "ALB", "GRE", "AEG", "EAS", "TYS", "ADR"] },
  { id: "IRI", name: "Irish Sea", kind: "sea", x: 249, y: 506, rx: 32, ry: 16, armyAdj: [], fleetAdj: ["NAO", "LVP", "WAL", "ENC"] },
  { id: "MAO", name: "Mid-Atlantic", kind: "sea", x: 140, y: 676, rx: 48, ry: 24, armyAdj: [], fleetAdj: ["NAO", "NTH", "IRI", "ENC", "BRE", "GAS", "SPA", "POR", "WES", "NAF"] },
  { id: "NTH", name: "North Sea", kind: "sea", x: 364, y: 431, rx: 52, ry: 26, armyAdj: [], fleetAdj: ["LVP", "EDI", "YOR", "LON", "BEL", "HOL", "HEL", "NOR", "NWG", "SKG", "NAO", "MAO"] },
  { id: "NWG", name: "Norwegian Sea", kind: "sea", x: 316, y: 164, rx: 52, ry: 26, armyAdj: [], fleetAdj: ["EDI", "NOR", "BAR", "NTH", "NAO"] },
  { id: "SKG", name: "Skagerrak", kind: "sea", x: 451, y: 366, rx: 34, ry: 15, armyAdj: [], fleetAdj: ["NTH", "NOR", "DEN", "SWE"] },
  { id: "TYS", name: "Tyrrhenian Sea", kind: "sea", x: 484, y: 695, rx: 34, ry: 15, armyAdj: [], fleetAdj: ["WES", "GOL", "TUS", "NAP", "ION"] },
  { id: "WES", name: "Western Med.", kind: "sea", x: 397, y: 718, rx: 46, ry: 22, armyAdj: [], fleetAdj: ["MAO", "SPA", "GOL", "TYS", "TUN"] },
  { id: "BLA", name: "Black Sea", kind: "sea", x: 757, y: 632, rx: 48, ry: 24, armyAdj: [], fleetAdj: ["SEV", "RUM", "BUL", "CON", "ANK"] },
  { id: "BOT", name: "Gulf of Bothnia", kind: "sea", x: 592, y: 357, rx: 34, ry: 16, armyAdj: [], fleetAdj: [] },
];

/** The six fleet locations belonging to the three provinces with two coasts. */
export const COAST_LOCATIONS: CoastLocation[] = [
  { id: "SPA/NC", province: "SPA", name: "Spain (north coast)", fleetAdj: ["MAO", "POR", "GAS"], x: 292, y: 654 },
  { id: "SPA/SC", province: "SPA", name: "Spain (south coast)", fleetAdj: ["MAO", "POR", "WES", "GOL", "MAR"], x: 315, y: 679 },
  { id: "STP/NC", province: "STP", name: "St. Petersburg (north coast)", fleetAdj: ["BAR", "NOR"], x: 748, y: 288 },
  { id: "STP/SC", province: "STP", name: "St. Petersburg (south coast)", fleetAdj: ["BOT", "FIN", "LIV"], x: 710, y: 315 },
  { id: "BUL/EC", province: "BUL", name: "Bulgaria (east coast)", fleetAdj: ["BLA", "RUM", "CON"], x: 632, y: 643 },
  { id: "BUL/SC", province: "BUL", name: "Bulgaria (south coast)", fleetAdj: ["AEG", "GRE", "CON"], x: 613, y: 661 },
];

// Corrections to the old node-map draft. Keeping topology here makes the two
// movement graphs independently reviewable instead of inferring fleet moves
// from a lossy "coastal" flag.
const topology: Record<string, Partial<Pick<Province, "armyAdj" | "fleetAdj">>> = {
  SWI: { armyAdj: [], fleetAdj: [] },
  PIC: { armyAdj: ["BRE", "PAR", "BEL", "BUR"], fleetAdj: ["BRE", "BEL", "ENC"] },
  ARM: { armyAdj: ["ANK", "SMY", "SEV", "SYR"], fleetAdj: ["ANK", "SEV", "BLA"] },
  ANK: { fleetAdj: ["CON", "ARM", "BLA"] },
  SEV: { fleetAdj: ["RUM", "ARM", "BLA"] },
  BLA: { fleetAdj: ["SEV", "RUM", "BUL/EC", "CON", "ANK", "ARM"] },
  NTH: { fleetAdj: ["EDI", "YOR", "LON", "BEL", "HOL", "HEL", "DEN", "NOR", "NWG", "SKG", "ENC"] },
  LVP: { armyAdj: ["EDI", "YOR", "WAL"], fleetAdj: ["EDI", "WAL", "IRI", "NAO"] },
  YOR: { armyAdj: ["EDI", "LVP", "LON", "WAL"], fleetAdj: ["EDI", "LON", "NTH"] },
  FIN: { fleetAdj: ["SWE", "BOT", "STP/SC"] },
  LIV: { fleetAdj: ["BAL", "BOT", "STP/SC"] },
  BAL: { fleetAdj: ["BER", "PRU", "SWE", "DEN", "KIE", "BOT"] },
  BOT: { fleetAdj: ["BAL", "SWE", "FIN", "STP/SC", "LIV"] },
  BAR: { fleetAdj: ["NOR", "STP/NC", "NWG"] },
  NOR: { fleetAdj: ["NWG", "NTH", "SKG", "SWE", "STP/NC"] },
  MAO: { fleetAdj: ["NAO", "IRI", "ENC", "BRE", "GAS", "SPA/NC", "SPA/SC", "POR", "WES", "NAF"] },
  GAS: { fleetAdj: ["BRE", "MAO", "SPA/NC"] },
  POR: { fleetAdj: ["MAO", "SPA/NC", "SPA/SC"] },
  WES: { fleetAdj: ["MAO", "SPA/SC", "GOL", "TYS", "TUN"] },
  GOL: { fleetAdj: ["SPA/SC", "MAR", "PIE", "TUS", "TYS", "WES"] },
  MAR: { fleetAdj: ["GOL", "PIE", "SPA/SC"] },
  RUM: { fleetAdj: ["SEV", "BLA", "BUL/EC"] },
  CON: { fleetAdj: ["BLA", "BUL/EC", "BUL/SC", "AEG", "SMY", "ANK"] },
  AEG: { fleetAdj: ["GRE", "BUL/SC", "CON", "SMY", "EAS", "ION"] },
  GRE: { fleetAdj: ["ALB", "ION", "AEG", "BUL/SC"] },
  SPA: { fleetAdj: [] }, STP: { fleetAdj: [] }, BUL: { fleetAdj: [] },
};
for (const province of PROVINCES) Object.assign(province, topology[province.id]);

export const provinceId = (location: string): string => location.split("/")[0];
export const coastLocation = (id: string): CoastLocation | undefined => COAST_LOCATIONS.find((coast) => coast.id === id);

export const PROVINCE_MAP: Record<string, Province> = Object.fromEntries(
  [
    ...PROVINCES.map((p) => [p.id, p] as const),
    ...COAST_LOCATIONS.map((coast) => {
      const province = PROVINCES.find((candidate) => candidate.id === coast.province)!;
      return [coast.id, { ...province, id: coast.id, name: coast.name, x: coast.x, y: coast.y, fleetAdj: coast.fleetAdj }] as const;
    }),
  ],
);

export const STARTING_UNITS: { power: PowerId; type: UnitType; loc: string }[] = [
  // Austria-Hungary
  { power: "AUS", type: "F", loc: "TRI" },
  { power: "AUS", type: "A", loc: "VIE" },
  { power: "AUS", type: "A", loc: "BUD" },
  // England
  { power: "ENG", type: "F", loc: "EDI" },
  { power: "ENG", type: "F", loc: "LON" },
  { power: "ENG", type: "A", loc: "LVP" },
  // France
  { power: "FRA", type: "A", loc: "PAR" },
  { power: "FRA", type: "A", loc: "MAR" },
  { power: "FRA", type: "F", loc: "BRE" },
  // Germany
  { power: "GER", type: "A", loc: "MUN" },
  { power: "GER", type: "A", loc: "BER" },
  { power: "GER", type: "F", loc: "KIE" },
  // Italy
  { power: "ITA", type: "A", loc: "ROM" },
  { power: "ITA", type: "A", loc: "VEN" },
  { power: "ITA", type: "F", loc: "NAP" },
  // Russia
  { power: "RUS", type: "A", loc: "MOS" },
  { power: "RUS", type: "A", loc: "WAR" },
  { power: "RUS", type: "F", loc: "STP/SC" },
  { power: "RUS", type: "F", loc: "SEV" },
  // Turkey
  { power: "TUR", type: "A", loc: "CON" },
  { power: "TUR", type: "A", loc: "SMY" },
  { power: "TUR", type: "F", loc: "ANK" },
];
