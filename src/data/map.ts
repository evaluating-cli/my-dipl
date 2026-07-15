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
  /** coastal provinces (and all seas) can host fleets; inland land cannot */
  coast: boolean;
  /** supply-centre status */
  supply?: "home" | "neutral";
  /** initial territorial owner (display tint) */
  owner?: PowerId;
  x: number;
  y: number;
  /** optional ellipse radii overrides for seas */
  rx?: number;
  ry?: number;
  adj: string[];
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
  RUS: ["MOS", "STP", "SEV"],
  TUR: ["CON", "ANK", "SMY"],
};

export const PROVINCES: Province[] = [
  // ---------------- AUSTRIA-HUNGARY ----------------
  { id: "VIE", name: "Vienna", kind: "land", coast: false, supply: "home", owner: "AUS", x: 745, y: 555, adj: ["BUD", "GAL", "BOH", "TYR", "TRI"] },
  { id: "BUD", name: "Budapest", kind: "land", coast: false, supply: "home", owner: "AUS", x: 800, y: 505, adj: ["VIE", "GAL", "RUM", "SER", "TRI"] },
  { id: "TRI", name: "Trieste", kind: "land", coast: true, supply: "home", owner: "AUS", x: 690, y: 610, adj: ["VIE", "BUD", "TYR", "VEN", "ADR"] },
  { id: "GAL", name: "Galicia", kind: "land", coast: false, owner: "AUS", x: 880, y: 415, adj: ["VIE", "BUD", "SIL", "WAR", "UKR", "RUM"] },
  { id: "BOH", name: "Bohemia", kind: "land", coast: false, owner: "AUS", x: 745, y: 470, adj: ["VIE", "MUN", "SIL", "TYR", "GAL"] },
  { id: "TYR", name: "Tyrolia", kind: "land", coast: false, owner: "AUS", x: 685, y: 545, adj: ["VIE", "TRI", "BOH", "MUN", "PIE", "VEN"] },

  // ---------------- ENGLAND ----------------
  { id: "LON", name: "London", kind: "land", coast: true, supply: "home", owner: "ENG", x: 405, y: 310, adj: ["LVP", "YOR", "WAL", "ENC", "NTH"] },
  { id: "LVP", name: "Liverpool", kind: "land", coast: true, supply: "home", owner: "ENG", x: 300, y: 235, adj: ["EDI", "YOR", "LON", "WAL", "IRI", "NTH"] },
  { id: "EDI", name: "Edinburgh", kind: "land", coast: true, supply: "home", owner: "ENG", x: 345, y: 150, adj: ["LVP", "YOR", "NWG", "NTH"] },
  { id: "YOR", name: "Yorkshire", kind: "land", coast: true, owner: "ENG", x: 420, y: 220, adj: ["EDI", "LON", "WAL", "NTH", "LVP"] },
  { id: "WAL", name: "Wales", kind: "land", coast: true, owner: "ENG", x: 300, y: 345, adj: ["LVP", "LON", "IRI", "ENC"] },

  // ---------------- FRANCE ----------------
  { id: "PAR", name: "Paris", kind: "land", coast: false, supply: "home", owner: "FRA", x: 445, y: 445, adj: ["PIC", "BUR", "GAS"] },
  { id: "BRE", name: "Brest", kind: "land", coast: true, supply: "home", owner: "FRA", x: 330, y: 460, adj: ["PIC", "PAR", "GAS", "ENC", "MAO"] },
  { id: "MAR", name: "Marseilles", kind: "land", coast: true, supply: "home", owner: "FRA", x: 515, y: 625, adj: ["BUR", "PIE", "SPA", "GOL"] },
  { id: "PIC", name: "Picardy", kind: "land", coast: true, owner: "FRA", x: 420, y: 400, adj: ["BRE", "PAR", "BEL", "ENC"] },
  { id: "BUR", name: "Burgundy", kind: "land", coast: false, owner: "FRA", x: 520, y: 510, adj: ["PAR", "MAR", "GAS", "PIE", "RUH", "MUN", "PIC"] },
  { id: "GAS", name: "Gascony", kind: "land", coast: true, owner: "FRA", x: 420, y: 555, adj: ["BRE", "PAR", "BUR", "SPA", "MAO"] },

  // ---------------- GERMANY ----------------
  { id: "BER", name: "Berlin", kind: "land", coast: true, supply: "home", owner: "GER", x: 735, y: 285, adj: ["MUN", "SIL", "KIE", "PRU", "BAL"] },
  { id: "KIE", name: "Kiel", kind: "land", coast: true, supply: "home", owner: "GER", x: 650, y: 355, adj: ["MUN", "RUH", "BER", "BAL", "HEL", "DEN", "HOL"] },
  { id: "MUN", name: "Munich", kind: "land", coast: false, supply: "home", owner: "GER", x: 675, y: 440, adj: ["BER", "SIL", "BOH", "TYR", "BUR", "RUH", "KIE"] },
  { id: "RUH", name: "Ruhr", kind: "land", coast: false, owner: "GER", x: 565, y: 425, adj: ["MUN", "KIE", "BEL", "HOL", "BUR"] },
  { id: "SIL", name: "Silesia", kind: "land", coast: false, owner: "GER", x: 795, y: 370, adj: ["MUN", "BER", "PRU", "WAR", "BOH", "GAL"] },

  // ---------------- ITALY ----------------
  { id: "ROM", name: "Rome", kind: "land", coast: true, supply: "home", owner: "ITA", x: 555, y: 645, adj: ["TUS", "NAP", "APU", "VEN"] },
  { id: "VEN", name: "Venice", kind: "land", coast: true, supply: "home", owner: "ITA", x: 625, y: 595, adj: ["PIE", "TUS", "APU", "TYR", "TRI", "ADR"] },
  { id: "NAP", name: "Naples", kind: "land", coast: true, supply: "home", owner: "ITA", x: 640, y: 785, adj: ["ROM", "APU", "ION", "TYS"] },
  { id: "PIE", name: "Piedmont", kind: "land", coast: true, owner: "ITA", x: 555, y: 585, adj: ["MAR", "BUR", "VEN", "TYR", "GOL", "TUS"] },
  { id: "TUS", name: "Tuscany", kind: "land", coast: true, owner: "ITA", x: 580, y: 700, adj: ["ROM", "VEN", "PIE", "TYS", "GOL"] },
  { id: "APU", name: "Apulia", kind: "land", coast: true, owner: "ITA", x: 665, y: 715, adj: ["VEN", "ROM", "NAP", "ION", "ADR"] },

  // ---------------- RUSSIA ----------------
  { id: "MOS", name: "Moscow", kind: "land", coast: false, supply: "home", owner: "RUS", x: 930, y: 265, adj: ["SEV", "WAR", "UKR", "LIV", "STP"] },
  { id: "STP", name: "St. Petersburg", kind: "land", coast: true, supply: "home", owner: "RUS", x: 770, y: 140, adj: ["FIN", "BAR", "LIV", "MOS", "NOR"] },
  { id: "SEV", name: "Sevastopol", kind: "land", coast: true, supply: "home", owner: "RUS", x: 985, y: 430, adj: ["MOS", "UKR", "RUM", "ARM", "BLA"] },
  { id: "WAR", name: "Warsaw", kind: "land", coast: false, owner: "RUS", x: 850, y: 325, adj: ["MOS", "UKR", "GAL", "SIL", "PRU"] },
  { id: "UKR", name: "Ukraine", kind: "land", coast: false, owner: "RUS", x: 950, y: 375, adj: ["MOS", "WAR", "GAL", "RUM", "SEV"] },
  { id: "LIV", name: "Livonia", kind: "land", coast: true, owner: "RUS", x: 815, y: 150, adj: ["MOS", "PRU", "BAL", "STP", "WAR"] },
  { id: "FIN", name: "Finland", kind: "land", coast: true, owner: "RUS", x: 660, y: 75, adj: ["STP", "SWE", "NOR", "BAR"] },

  // ---------------- TURKEY ----------------
  { id: "CON", name: "Constantinople", kind: "land", coast: true, supply: "home", owner: "TUR", x: 975, y: 555, adj: ["ANK", "SMY", "BLA", "AEG", "BUL", "MRS"] },
  { id: "ANK", name: "Ankara", kind: "land", coast: true, supply: "home", owner: "TUR", x: 1035, y: 635, adj: ["CON", "SMY", "ARM", "BLA", "MRS"] },
  { id: "SMY", name: "Smyrna", kind: "land", coast: true, supply: "home", owner: "TUR", x: 985, y: 700, adj: ["CON", "ANK", "ARM", "SYR", "AEG", "EAS"] },
  { id: "ARM", name: "Armenia", kind: "land", coast: false, owner: "TUR", x: 1080, y: 570, adj: ["ANK", "SMY", "SEV", "SYR", "BLA"] },
  { id: "SYR", name: "Syria", kind: "land", coast: true, owner: "TUR", x: 1115, y: 660, adj: ["SMY", "ARM", "EAS"] },

  // ---------------- NEUTRAL SUPPLY CENTRES ----------------
  { id: "BEL", name: "Belgium", kind: "land", coast: true, supply: "neutral", owner: "NEU", x: 500, y: 345, adj: ["PIC", "BUR", "RUH", "HOL", "ENC", "NTH"] },
  { id: "HOL", name: "Holland", kind: "land", coast: true, supply: "neutral", owner: "NEU", x: 555, y: 295, adj: ["RUH", "BEL", "KIE", "HEL", "NTH"] },
  { id: "DEN", name: "Denmark", kind: "land", coast: true, supply: "neutral", owner: "NEU", x: 585, y: 215, adj: ["KIE", "SWE", "NOR", "SKG", "HEL", "BAL"] },
  { id: "NOR", name: "Norway", kind: "land", coast: true, supply: "neutral", owner: "NEU", x: 440, y: 70, adj: ["NWG", "SWE", "FIN", "BAR", "SKG", "NTH", "STP"] },
  { id: "SWE", name: "Sweden", kind: "land", coast: true, supply: "neutral", owner: "NEU", x: 640, y: 135, adj: ["DEN", "NOR", "FIN", "BAL", "SKG"] },
  { id: "SPA", name: "Spain", kind: "land", coast: true, supply: "neutral", owner: "NEU", x: 335, y: 650, adj: ["POR", "GAS", "MAR", "MAO", "WES", "GOL"] },
  { id: "POR", name: "Portugal", kind: "land", coast: true, supply: "neutral", owner: "NEU", x: 245, y: 640, adj: ["SPA", "MAO"] },
  { id: "GRE", name: "Greece", kind: "land", coast: true, supply: "neutral", owner: "NEU", x: 800, y: 640, adj: ["AEG", "ION", "SER", "BUL", "ALB"] },
  { id: "SER", name: "Serbia", kind: "land", coast: false, supply: "neutral", owner: "NEU", x: 825, y: 555, adj: ["BUD", "RUM", "GRE", "ALB", "BUL", "TRI"] },
  { id: "RUM", name: "Romania", kind: "land", coast: true, supply: "neutral", owner: "NEU", x: 905, y: 485, adj: ["BUD", "GAL", "UKR", "SEV", "BLA", "BUL", "SER"] },
  { id: "BUL", name: "Bulgaria", kind: "land", coast: true, supply: "neutral", owner: "NEU", x: 895, y: 555, adj: ["CON", "GRE", "SER", "RUM", "BLA", "AEG", "MRS"] },
  { id: "TUN", name: "Tunisia", kind: "land", coast: true, supply: "neutral", owner: "NEU", x: 555, y: 790, adj: ["WES", "TYS", "ION", "EAS"] },

  { id: "PRU", name: "Prussia", kind: "land", coast: true, owner: "GER", x: 825, y: 235, adj: ["BER", "SIL", "WAR", "LIV", "BAL"] },

  // ---------------- NEUTRAL (non-supply) ----------------
  { id: "ALB", name: "Albania", kind: "land", coast: true, owner: "NEU", x: 765, y: 675, adj: ["GRE", "SER", "ION", "ADR", "TRI"] },
  { id: "SWI", name: "Switzerland", kind: "land", coast: false, owner: "NEU", x: 595, y: 545, adj: ["MUN", "TYR", "BUR", "PIE"] },
  { id: "NAF", name: "North Africa", kind: "land", coast: true, owner: "NEU", x: 300, y: 765, adj: ["MAO", "WES", "TUN"] },

  // ---------------- SEAS ----------------
  { id: "ADR", name: "Adriatic Sea", kind: "sea", coast: true, x: 695, y: 660, rx: 38, ry: 17, adj: ["VEN", "TRI", "ALB", "ION", "APU"] },
  { id: "AEG", name: "Aegean Sea", kind: "sea", coast: true, x: 880, y: 660, rx: 38, ry: 17, adj: ["GRE", "ION", "EAS", "SMY", "CON", "BUL", "MRS"] },
  { id: "ATL", name: "Atlantic Ocean", kind: "sea", coast: true, x: 150, y: 470, rx: 70, ry: 42, adj: ["POR", "IRI", "NWG", "MAO", "NTH"] },
  { id: "BAL", name: "Baltic Sea", kind: "sea", coast: true, x: 730, y: 215, rx: 42, ry: 19, adj: ["BER", "PRU", "LIV", "SWE", "DEN", "KIE"] },
  { id: "BAR", name: "Barents Sea", kind: "sea", coast: true, x: 90, y: 100, rx: 60, ry: 36, adj: ["NOR", "FIN", "STP", "NWG"] },
  { id: "EAS", name: "Eastern Med.", kind: "sea", coast: true, x: 925, y: 760, rx: 46, ry: 22, adj: ["ION", "AEG", "SMY", "SYR"] },
  { id: "ENC", name: "English Channel", kind: "sea", coast: true, x: 455, y: 362, rx: 36, ry: 16, adj: ["NTH", "IRI", "LON", "WAL", "BEL", "PIC", "BRE", "MAO", "ATL"] },
  { id: "GOL", name: "Gulf of Lyon", kind: "sea", coast: true, x: 478, y: 680, rx: 40, ry: 18, adj: ["SPA", "PIE", "MAR", "TUS", "TYS", "WES"] },
  { id: "HEL", name: "Heligoland Bight", kind: "sea", coast: true, x: 672, y: 305, rx: 34, ry: 15, adj: ["NTH", "HOL", "KIE", "DEN"] },
  { id: "ION", name: "Ionian Sea", kind: "sea", coast: true, x: 745, y: 725, rx: 44, ry: 20, adj: ["TUN", "NAP", "APU", "ALB", "GRE", "AEG", "EAS", "TYS", "ADR"] },
  { id: "IRI", name: "Irish Sea", kind: "sea", coast: true, x: 222, y: 285, rx: 32, ry: 16, adj: ["ATL", "LVP", "WAL", "ENC"] },
  { id: "MAO", name: "Mid-Atlantic", kind: "sea", coast: true, x: 230, y: 560, rx: 48, ry: 24, adj: ["ATL", "NTH", "IRI", "ENC", "BRE", "GAS", "SPA", "POR", "WES", "NAF"] },
  { id: "MRS", name: "Marmara Sea", kind: "sea", coast: true, x: 945, y: 610, rx: 30, ry: 14, adj: ["CON", "AEG", "BLA", "ANK", "BUL"] },
  { id: "NTH", name: "North Sea", kind: "sea", coast: true, x: 520, y: 145, rx: 52, ry: 26, adj: ["LVP", "EDI", "YOR", "LON", "BEL", "HOL", "HEL", "NOR", "NWG", "SKG", "ATL", "MAO"] },
  { id: "NWG", name: "Norwegian Sea", kind: "sea", coast: true, x: 255, y: 95, rx: 52, ry: 26, adj: ["EDI", "NOR", "BAR", "NTH", "ATL"] },
  { id: "SKG", name: "Skagerrak", kind: "sea", coast: true, x: 595, y: 130, rx: 34, ry: 15, adj: ["NTH", "NOR", "DEN", "SWE"] },
  { id: "TYS", name: "Tyrrhenian Sea", kind: "sea", coast: true, x: 615, y: 748, rx: 34, ry: 15, adj: ["WES", "GOL", "TUS", "NAP", "ION"] },
  { id: "WES", name: "Western Med.", kind: "sea", coast: true, x: 425, y: 740, rx: 46, ry: 22, adj: ["MAO", "SPA", "GOL", "TYS", "TUN"] },
  { id: "BLA", name: "Black Sea", kind: "sea", coast: true, x: 990, y: 480, rx: 48, ry: 24, adj: ["SEV", "RUM", "BUL", "CON", "ANK", "ARM", "MRS"] },
];

export const PROVINCE_MAP: Record<string, Province> = Object.fromEntries(
  PROVINCES.map((p) => [p.id, p]),
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
  { power: "RUS", type: "F", loc: "STP" },
  { power: "RUS", type: "F", loc: "SEV" },
  // Turkey
  { power: "TUR", type: "A", loc: "CON" },
  { power: "TUR", type: "A", loc: "SMY" },
  { power: "TUR", type: "F", loc: "ANK" },
];
