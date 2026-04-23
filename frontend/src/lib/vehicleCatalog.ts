export const FUEL_TYPE_OPTIONS = ["Gasolina","Etanol","Flex","Diesel","GNV","Elétrico","Híbrido"] as const;
export const MAINTENANCE_PRIORITY_OPTIONS = [
  { value: "LOW", label: "Baixa" },
  { value: "MEDIUM", label: "Média" },
  { value: "HIGH", label: "Alta" },
  { value: "CRITICAL", label: "Crítica" },
] as const;
export const MAINTENANCE_TYPE_OPTIONS = ["Troca de óleo","Freios","Pneus","Suspensão","Alinhamento e balanceamento","Bateria","Motor","Câmbio","Ar-condicionado","Elétrica","Revisão geral","Funilaria","Outro"] as const;
type VehicleCatalogEntry = { make: string; model: string; year: number; fuel_type: string };
export const VEHICLE_CATALOG: VehicleCatalogEntry[] = [
  { make: "Toyota", model: "Corolla", year: 2010, fuel_type: "Gasolina" },
  { make: "Toyota", model: "Corolla", year: 2011, fuel_type: "Gasolina" },
  { make: "Toyota", model: "Corolla", year: 2012, fuel_type: "Flex" },
  { make: "Toyota", model: "Corolla", year: 2013, fuel_type: "Flex" },
  { make: "Toyota", model: "Hilux", year: 2012, fuel_type: "Diesel" },
  { make: "Toyota", model: "Hilux", year: 2013, fuel_type: "Diesel" },
  { make: "Toyota", model: "Yaris", year: 2019, fuel_type: "Flex" },
  { make: "Toyota", model: "Yaris", year: 2020, fuel_type: "Flex" },
  { make: "Chevrolet", model: "Cruze", year: 2012, fuel_type: "Gasolina" },
  { make: "Chevrolet", model: "Cruze", year: 2013, fuel_type: "Gasolina" },
  { make: "Chevrolet", model: "Onix", year: 2019, fuel_type: "Flex" },
  { make: "Chevrolet", model: "Onix", year: 2020, fuel_type: "Flex" },
  { make: "Chevrolet", model: "S10", year: 2022, fuel_type: "Diesel" },
  { make: "Chevrolet", model: "S10", year: 2023, fuel_type: "Diesel" },
  { make: "Fiat", model: "Strada", year: 2021, fuel_type: "Flex" },
  { make: "Fiat", model: "Strada", year: 2022, fuel_type: "Flex" },
  { make: "Fiat", model: "Toro", year: 2022, fuel_type: "Diesel" },
  { make: "Fiat", model: "Toro", year: 2023, fuel_type: "Diesel" },
  { make: "Volkswagen", model: "Gol", year: 2019, fuel_type: "Flex" },
  { make: "Volkswagen", model: "Saveiro", year: 2021, fuel_type: "Flex" },
  { make: "Volkswagen", model: "Amarok", year: 2024, fuel_type: "Diesel" },
  { make: "Ford", model: "Ranger", year: 2023, fuel_type: "Diesel" },
  { make: "Ford", model: "Ka", year: 2019, fuel_type: "Flex" },
  { make: "Honda", model: "Civic", year: 2012, fuel_type: "Flex" },
  { make: "Honda", model: "HR-V", year: 2021, fuel_type: "Flex" },
  { make: "Hyundai", model: "HB20", year: 2021, fuel_type: "Flex" },
  { make: "Hyundai", model: "Creta", year: 2022, fuel_type: "Flex" },
];
const normalize = (value: string) => value.trim().toLowerCase();
export const getAvailableMakes = (extraMakes: string[] = []) => [...new Set([...VEHICLE_CATALOG.map((item) => item.make), ...extraMakes.filter(Boolean)])].sort((a,b)=>a.localeCompare(b,"pt-BR"));
export const getAvailableYears = (make: string, extraYears: Array<string|number> = []) => [...new Set([...VEHICLE_CATALOG.filter((item)=>normalize(item.make)===normalize(make)).map((item)=>item.year), ...extraYears.map(Number).filter((year)=>!Number.isNaN(year)&&year>0)])].sort((a,b)=>b-a);
export const getAvailableModels = (make: string, year?: string|number, extraModels: string[] = []) => {
  const normalizedMake = normalize(make); const normalizedYear = Number(year);
  return [...new Set([...VEHICLE_CATALOG.filter((item)=> normalize(item.make)===normalizedMake && ((Number.isNaN(normalizedYear)||normalizedYear<=0)|| item.year===normalizedYear)).map((item)=>item.model), ...extraModels.filter(Boolean)])].sort((a,b)=>a.localeCompare(b,"pt-BR"));
};
export const getCatalogFuelType = (make: string, year?: string|number, model?: string) => VEHICLE_CATALOG.find((item)=>normalize(item.make)===normalize(make) && item.year===Number(year) && normalize(item.model)===normalize(model||""))?.fuel_type || "";