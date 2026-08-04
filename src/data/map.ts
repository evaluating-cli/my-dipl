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
  RUS: ["MOS", "STP", "SEV", "WAR"],
  TUR: ["CON", "ANK", "SMY"],
};

export const PROVINCES: Province[] = [
  // ---------------- AUSTRIA-HUNGARY ----------------
  { id: "VIE", name: "Vienna", kind: "land", coast: false, supply: "home", owner: "AUS", x: 540, y: 571, adj: ["BUD", "GAL", "BOH", "TYR", "TRI"] },
  { id: "BUD", name: "Budapest", kind: "land", coast: false, supply: "home", owner: "AUS", x: 571, y: 596, adj: ["VIE", "GAL", "RUM", "SER", "TRI"] },
  { id: "TRI", name: "Trieste", kind: "land", coast: true, supply: "home", owner: "AUS", x: 534, y: 627, adj: ["VIE", "BUD", "TYR", "VEN", "ADR"] },
  { id: "GAL", name: "Galicia", kind: "land", coast: false, owner: "AUS", x: 592, y: 551, adj: ["VIE", "BUD", "SIL", "WAR", "UKR", "RUM"] },
  { id: "BOH", name: "Bohemia", kind: "land", coast: false, owner: "AUS", x: 517, y: 527, adj: ["VIE", "MUN", "SIL", "TYR", "GAL"] },
  { id: "TYR", name: "Tyrolia", kind: "land", coast: false, owner: "AUS", x: 492, y: 571, adj: ["VIE", "TRI", "BOH", "MUN", "PIE", "VEN"] },

  // ---------------- ENGLAND ----------------
  { id: "LON", name: "London", kind: "land", coast: true, supply: "home", owner: "ENG", x: 346, y: 481, adj: ["LVP", "YOR", "WAL", "ENC", "NTH"] },
  { id: "LVP", name: "Liverpool", kind: "land", coast: true, supply: "home", owner: "ENG", x: 284, y: 429, adj: ["EDI", "YOR", "LON", "WAL", "IRI", "NTH"] },
  { id: "EDI", name: "Edinburgh", kind: "land", coast: true, supply: "home", owner: "ENG", x: 303, y: 395, adj: ["LVP", "YOR", "NWG", "NTH"] },
  { id: "YOR", name: "Yorkshire", kind: "land", coast: true, owner: "ENG", x: 321, y: 453, adj: ["EDI", "LON", "WAL", "NTH", "LVP"] },
  { id: "WAL", name: "Wales", kind: "land", coast: true, owner: "ENG", x: 298, y: 508, adj: ["LVP", "LON", "IRI", "ENC"] },

  // ---------------- FRANCE ----------------
  { id: "PAR", name: "Paris", kind: "land", coast: false, supply: "home", owner: "FRA", x: 359, y: 573, adj: ["PIC", "BUR", "GAS"] },
  { id: "BRE", name: "Brest", kind: "land", coast: true, supply: "home", owner: "FRA", x: 303, y: 559, adj: ["PIC", "PAR", "GAS", "ENC", "MAO"] },
  { id: "MAR", name: "Marseilles", kind: "land", coast: true, supply: "home", owner: "FRA", x: 400, y: 629, adj: ["BUR", "PIE", "SPA", "GOL"] },
  { id: "PIC", name: "Picardy", kind: "land", coast: true, owner: "FRA", x: 354, y: 531, adj: ["BRE", "PAR", "BEL", "ENC"] },
  { id: "BUR", name: "Burgundy", kind: "land", coast: false, owner: "FRA", x: 395, y: 562, adj: ["PAR", "MAR", "GAS", "PIE", "RUH", "MUN", "PIC"] },
  { id: "GAS", name: "Gascony", kind: "land", coast: true, owner: "FRA", x: 335, y: 624, adj: ["BRE", "PAR", "BUR", "SPA", "MAO"] },

  // ---------------- GERMANY ----------------
  { id: "BER", name: "Berlin", kind: "land", coast: true, supply: "home", owner: "GER", x: 477, y: 455, adj: ["MUN", "SIL", "KIE", "PRU", "BAL"] },
  { id: "KIE", name: "Kiel", kind: "land", coast: true, supply: "home", owner: "GER", x: 445, y: 450, adj: ["MUN", "RUH", "BER", "BAL", "HEL", "DEN", "HOL"] },
  { id: "MUN", name: "Munich", kind: "land", coast: false, supply: "home", owner: "GER", x: 443, y: 555, adj: ["BER", "SIL", "BOH", "TYR", "BUR", "RUH", "KIE"] },
  { id: "RUH", name: "Ruhr", kind: "land", coast: false, owner: "GER", x: 421, y: 512, adj: ["MUN", "KIE", "BEL", "HOL", "BUR"] },
  { id: "SIL", name: "Silesia", kind: "land", coast: false, owner: "GER", x: 539, y: 503, adj: ["MUN", "BER", "PRU", "WAR", "BOH", "GAL"] },

  // ---------------- ITALY ----------------
  { id: "ROM", name: "Rome", kind: "land", coast: true, supply: "home", owner: "ITA", x: 482, y: 654, adj: ["TUS", "NAP", "APU", "VEN"] },
  { id: "VEN", name: "Venice", kind: "land", coast: true, supply: "home", owner: "ITA", x: 478, y: 611, adj: ["PIE", "TUS", "APU", "TYR", "TRI", "ADR"] },
  { id: "NAP", name: "Naples", kind: "land", coast: true, supply: "home", owner: "ITA", x: 514, y: 683, adj: ["ROM", "APU", "ION", "TYS"] },
  { id: "PIE", name: "Piedmont", kind: "land", coast: true, owner: "ITA", x: 429, y: 615, adj: ["MAR", "BUR", "VEN", "TYR", "GOL", "TUS"] },
  { id: "TUS", name: "Tuscany", kind: "land", coast: true, owner: "ITA", x: 453, y: 625, adj: ["ROM", "VEN", "PIE", "TYS", "GOL"] },
  { id: "APU", name: "Apulia", kind: "land", coast: true, owner: "ITA", x: 525, y: 662, adj: ["VEN", "ROM", "NAP", "ION", "ADR"] },

  // ---------------- RUSSIA ----------------
  { id: "MOS", name: "Moscow", kind: "land", coast: false, supply: "home", owner: "RUS", x: 741, y: 441, adj: ["SEV", "WAR", "UKR", "LIV", "STP"] },
  { id: "STP", name: "St. Petersburg", kind: "land", coast: true, supply: "home", owner: "RUS", x: 729, y: 301, adj: ["FIN", "BAR", "LIV", "MOS", "NOR"] },
  { id: "SEV", name: "Sevastopol", kind: "land", coast: true, supply: "home", owner: "RUS", x: 731, y: 595, adj: ["MOS", "UKR", "RUM", "ARM", "BLA"] },
  { id: "WAR", name: "Warsaw", kind: "land", coast: false, supply: "home", owner: "RUS", x: 621, y: 485, adj: ["MOS", "UKR", "GAL", "SIL", "PRU"] },
  { id: "UKR", name: "Ukraine", kind: "land", coast: false, owner: "RUS", x: 680, y: 515, adj: ["MOS", "WAR", "GAL", "RUM", "SEV"] },
  { id: "LIV", name: "Livonia", kind: "land", coast: true, owner: "RUS", x: 596, y: 400, adj: ["MOS", "PRU", "BAL", "STP", "WAR"] },
  { id: "FIN", name: "Finland", kind: "land", coast: true, owner: "RUS", x: 598, y: 298, adj: ["STP", "SWE", "NOR", "BAR"] },

  // ---------------- TURKEY ----------------
  { id: "CON", name: "Constantinople", kind: "land", coast: true, supply: "home", owner: "TUR", x: 656, y: 697, adj: ["ANK", "SMY", "BLA", "AEG", "BUL", "MRS"] },
  { id: "ANK", name: "Ankara", kind: "land", coast: true, supply: "home", owner: "TUR", x: 731, y: 666, adj: ["CON", "SMY", "ARM", "BLA", "MRS"] },
  { id: "SMY", name: "Smyrna", kind: "land", coast: true, supply: "home", owner: "TUR", x: 696, y: 729, adj: ["CON", "ANK", "ARM", "SYR", "AEG", "EAS"] },
  { id: "ARM", name: "Armenia", kind: "land", coast: false, owner: "TUR", x: 826, y: 651, adj: ["ANK", "SMY", "SEV", "SYR", "BLA"] },
  { id: "SYR", name: "Syria", kind: "land", coast: true, owner: "TUR", x: 759, y: 753, adj: ["SMY", "ARM", "EAS"] },

  // ---------------- NEUTRAL SUPPLY CENTRES ----------------
  { id: "BEL", name: "Belgium", kind: "land", coast: true, supply: "neutral", owner: "NEU", x: 381, y: 509, adj: ["PIC", "BUR", "RUH", "HOL", "ENC", "NTH"] },
  { id: "HOL", name: "Holland", kind: "land", coast: true, supply: "neutral", owner: "NEU", x: 397, y: 484, adj: ["RUH", "BEL", "KIE", "HEL", "NTH"] },
  { id: "DEN", name: "Denmark", kind: "land", coast: true, supply: "neutral", owner: "NEU", x: 445, y: 417, adj: ["KIE", "SWE", "NOR", "SKG", "HEL", "BAL"] },
  { id: "NOR", name: "Norway", kind: "land", coast: true, supply: "neutral", owner: "NEU", x: 409, y: 333, adj: ["NWG", "SWE", "FIN", "BAR", "SKG", "NTH", "STP"] },
  { id: "SWE", name: "Sweden", kind: "land", coast: true, supply: "neutral", owner: "NEU", x: 530, y: 340, adj: ["DEN", "NOR", "FIN", "BAL", "SKG"] },
  { id: "SPA", name: "Spain", kind: "land", coast: true, supply: "neutral", owner: "NEU", x: 305, y: 666, adj: ["POR", "GAS", "MAR", "MAO", "WES", "GOL"] },
  { id: "POR", name: "Portugal", kind: "land", coast: true, supply: "neutral", owner: "NEU", x: 246, y: 709, adj: ["SPA", "MAO"] },
  { id: "GRE", name: "Greece", kind: "land", coast: true, supply: "neutral", owner: "NEU", x: 583, y: 700, adj: ["AEG", "ION", "SER", "BUL", "ALB"] },
  { id: "SER", name: "Serbia", kind: "land", coast: false, supply: "neutral", owner: "NEU", x: 584, y: 649, adj: ["BUD", "RUM", "GRE", "ALB", "BUL", "TRI"] },
  { id: "RUM", name: "Romania", kind: "land", coast: true, supply: "neutral", owner: "NEU", x: 655, y: 616, adj: ["BUD", "GAL", "UKR", "SEV", "BLA", "BUL", "SER"] },
  { id: "BUL", name: "Bulgaria", kind: "land", coast: true, supply: "neutral", owner: "NEU", x: 619, y: 648, adj: ["CON", "GRE", "SER", "RUM", "BLA", "AEG", "MRS"] },
  { id: "TUN", name: "Tunisia", kind: "land", coast: true, supply: "neutral", owner: "NEU", x: 455, y: 753, adj: ["WES", "TYS", "ION", "EAS"] },

  { id: "PRU", name: "Prussia", kind: "land", coast: true, owner: "GER", x: 564, y: 449, adj: ["BER", "SIL", "WAR", "LIV", "BAL"] },

  // ---------------- NEUTRAL (non-supply) ----------------
  { id: "ALB", name: "Albania", kind: "land", coast: true, owner: "NEU", x: 564, y: 668, adj: ["GRE", "SER", "ION", "ADR", "TRI"] },
  { id: "SWI", name: "Switzerland", kind: "land", coast: false, owner: "NEU", x: 595, y: 545, adj: ["MUN", "TYR", "BUR", "PIE"] },
  { id: "NAF", name: "North Africa", kind: "land", coast: true, owner: "NEU", x: 302, y: 765, adj: ["MAO", "WES", "TUN"] },

  // ---------------- SEAS ----------------
  { id: "ADR", name: "Adriatic Sea", kind: "sea", coast: true, x: 510, y: 632, rx: 38, ry: 17, adj: ["VEN", "TRI", "ALB", "ION", "APU"] },
  { id: "AEG", name: "Aegean Sea", kind: "sea", coast: true, x: 629, y: 724, rx: 38, ry: 17, adj: ["GRE", "ION", "EAS", "SMY", "CON", "BUL", "MRS"] },
  { id: "ATL", name: "Atlantic Ocean", kind: "sea", coast: true, x: 106, y: 359, rx: 70, ry: 42, adj: ["POR", "IRI", "NWG", "MAO", "NTH"] },
  { id: "BAL", name: "Baltic Sea", kind: "sea", coast: true, x: 526, y: 417, rx: 42, ry: 19, adj: ["BER", "PRU", "LIV", "SWE", "DEN", "KIE"] },
  { id: "BAR", name: "Barents Sea", kind: "sea", coast: true, x: 850, y: 42, rx: 60, ry: 36, adj: ["NOR", "FIN", "STP", "NWG"] },
  { id: "EAS", name: "Eastern Med.", kind: "sea", coast: true, x: 651, y: 771, rx: 46, ry: 22, adj: ["ION", "AEG", "SMY", "SYR"] },
  { id: "ENC", name: "English Channel", kind: "sea", coast: true, x: 334, y: 516, rx: 36, ry: 16, adj: ["NTH", "IRI", "LON", "WAL", "BEL", "PIC", "BRE", "MAO", "ATL"] },
  { id: "GOL", name: "Gulf of Lyon", kind: "sea", coast: true, x: 389, y: 665, rx: 40, ry: 18, adj: ["SPA", "PIE", "MAR", "TUS", "TYS", "WES"] },
  { id: "HEL", name: "Heligoland Bight", kind: "sea", coast: true, x: 411, y: 442, rx: 34, ry: 15, adj: ["NTH", "HOL", "KIE", "DEN"] },
  { id: "ION", name: "Ionian Sea", kind: "sea", coast: true, x: 558, y: 767, rx: 44, ry: 20, adj: ["TUN", "NAP", "APU", "ALB", "GRE", "AEG", "EAS", "TYS", "ADR"] },
  { id: "IRI", name: "Irish Sea", kind: "sea", coast: true, x: 249, y: 506, rx: 32, ry: 16, adj: ["ATL", "LVP", "WAL", "ENC"] },
  { id: "MAO", name: "Mid-Atlantic", kind: "sea", coast: true, x: 140, y: 676, rx: 48, ry: 24, adj: ["ATL", "NTH", "IRI", "ENC", "BRE", "GAS", "SPA", "POR", "WES", "NAF"] },
  { id: "MRS", name: "Marmara Sea", kind: "sea", coast: true, x: 675, y: 672, rx: 16, ry: 10, adj: ["CON", "AEG", "BLA", "ANK", "BUL"] },
  { id: "NTH", name: "North Sea", kind: "sea", coast: true, x: 364, y: 431, rx: 52, ry: 26, adj: ["LVP", "EDI", "YOR", "LON", "BEL", "HOL", "HEL", "NOR", "NWG", "SKG", "ATL", "MAO"] },
  { id: "NWG", name: "Norwegian Sea", kind: "sea", coast: true, x: 316, y: 164, rx: 52, ry: 26, adj: ["EDI", "NOR", "BAR", "NTH", "ATL"] },
  { id: "SKG", name: "Skagerrak", kind: "sea", coast: true, x: 451, y: 366, rx: 34, ry: 15, adj: ["NTH", "NOR", "DEN", "SWE"] },
  { id: "TYS", name: "Tyrrhenian Sea", kind: "sea", coast: true, x: 484, y: 695, rx: 34, ry: 15, adj: ["WES", "GOL", "TUS", "NAP", "ION"] },
  { id: "WES", name: "Western Med.", kind: "sea", coast: true, x: 397, y: 718, rx: 46, ry: 22, adj: ["MAO", "SPA", "GOL", "TYS", "TUN"] },
  { id: "BLA", name: "Black Sea", kind: "sea", coast: true, x: 757, y: 632, rx: 48, ry: 24, adj: ["SEV", "RUM", "BUL", "CON", "ANK", "ARM", "MRS"] },
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
