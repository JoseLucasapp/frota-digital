// Mock data for ADS Frotas

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  brand: string;
  year: number;
  fuelType: string;
  status: "active" | "maintenance" | "inactive";
  km: number;
  driver?: string;
  lastFuel?: string;
  nextMaintenance?: string;
  lat?: number;
  lng?: number;
  moving?: boolean;
}

export interface Driver {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  cnhExpiry: string;
  cnhCategory: string;
  status: "active" | "inactive" | "suspended";
  vehicleId?: string;
  avatar?: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  driverId: string;
  driverName: string;
  date: string;
  fuelType: string;
  liters: number;
  cost: number;
  km: number;
  station: string;
}

export interface WorkOrder {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  type: "preventive" | "corrective";
  description: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  cost: number;
  createdAt: string;
  mechanic?: string;
}

export interface Notification {
  id: string;
  type: "document" | "maintenance" | "fuel" | "alert";
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export const vehicles: Vehicle[] = [
  { id: "v1", plate: "ABC-1D23", model: "Hilux SW4", brand: "Toyota", year: 2023, fuelType: "Diesel", status: "active", km: 45230, driver: "Carlos Silva", lastFuel: "2024-01-10", nextMaintenance: "2024-02-15", lat: -23.5505, lng: -46.6333, moving: true },
  { id: "v2", plate: "DEF-4G56", model: "Strada", brand: "Fiat", year: 2022, fuelType: "Flex", status: "active", km: 32100, driver: "Ana Souza", lastFuel: "2024-01-12", nextMaintenance: "2024-03-01", lat: -23.5615, lng: -46.6450, moving: false },
  { id: "v3", plate: "GHI-7H89", model: "S10", brand: "Chevrolet", year: 2024, fuelType: "Diesel", status: "maintenance", km: 15800, lastFuel: "2024-01-08", nextMaintenance: "2024-01-20", lat: -23.5400, lng: -46.6200, moving: false },
  { id: "v4", plate: "JKL-0I12", model: "Saveiro", brand: "VW", year: 2021, fuelType: "Flex", status: "active", km: 67500, driver: "Pedro Santos", lastFuel: "2024-01-11", nextMaintenance: "2024-02-28", lat: -23.5700, lng: -46.6500, moving: true },
  { id: "v5", plate: "MNO-3J45", model: "Ranger", brand: "Ford", year: 2023, fuelType: "Diesel", status: "active", km: 28900, driver: "Maria Lima", lastFuel: "2024-01-13", nextMaintenance: "2024-04-10", lat: -23.5450, lng: -46.6350, moving: true },
  { id: "v6", plate: "PQR-6K78", model: "Toro", brand: "Fiat", year: 2022, fuelType: "Diesel", status: "inactive", km: 89200, lastFuel: "2023-12-20", nextMaintenance: "2024-01-25" },
  { id: "v7", plate: "STU-9L01", model: "Amarok", brand: "VW", year: 2024, fuelType: "Diesel", status: "active", km: 8500, driver: "José Oliveira", lastFuel: "2024-01-14", nextMaintenance: "2024-06-01", lat: -23.5550, lng: -46.6280, moving: false },
  { id: "v8", plate: "VWX-2M34", model: "Frontier", brand: "Nissan", year: 2023, fuelType: "Diesel", status: "active", km: 41300, driver: "Fernanda Costa", lastFuel: "2024-01-09", nextMaintenance: "2024-03-15", lat: -23.5650, lng: -46.6550, moving: true },
];

export const drivers: Driver[] = [
  { id: "d1", name: "Carlos Silva", cpf: "123.456.789-00", email: "carlos@email.com", phone: "(11) 99999-1234", cnhExpiry: "2025-06-15", cnhCategory: "D", status: "active", vehicleId: "v1" },
  { id: "d2", name: "Ana Souza", cpf: "234.567.890-11", email: "ana@email.com", phone: "(11) 98888-2345", cnhExpiry: "2024-03-20", cnhCategory: "B", status: "active", vehicleId: "v2" },
  { id: "d3", name: "Pedro Santos", cpf: "345.678.901-22", email: "pedro@email.com", phone: "(11) 97777-3456", cnhExpiry: "2025-11-30", cnhCategory: "D", status: "active", vehicleId: "v4" },
  { id: "d4", name: "Maria Lima", cpf: "456.789.012-33", email: "maria@email.com", phone: "(11) 96666-4567", cnhExpiry: "2024-08-10", cnhCategory: "B", status: "active", vehicleId: "v5" },
  { id: "d5", name: "José Oliveira", cpf: "567.890.123-44", email: "jose@email.com", phone: "(11) 95555-5678", cnhExpiry: "2025-02-28", cnhCategory: "C", status: "active", vehicleId: "v7" },
  { id: "d6", name: "Fernanda Costa", cpf: "678.901.234-55", email: "fernanda@email.com", phone: "(11) 94444-6789", cnhExpiry: "2024-12-05", cnhCategory: "B", status: "active", vehicleId: "v8" },
  { id: "d7", name: "Roberto Alves", cpf: "789.012.345-66", email: "roberto@email.com", phone: "(11) 93333-7890", cnhExpiry: "2024-01-30", cnhCategory: "D", status: "suspended" },
];

export const fuelLogs: FuelLog[] = [
  { id: "f1", vehicleId: "v1", vehiclePlate: "ABC-1D23", driverId: "d1", driverName: "Carlos Silva", date: "2024-01-10", fuelType: "Diesel", liters: 65, cost: 389.35, km: 45230, station: "Posto Shell Centro" },
  { id: "f2", vehicleId: "v2", vehiclePlate: "DEF-4G56", driverId: "d2", driverName: "Ana Souza", date: "2024-01-12", fuelType: "Gasolina", liters: 42, cost: 252.42, km: 32100, station: "Posto BR Vila Nova" },
  { id: "f3", vehicleId: "v4", vehiclePlate: "JKL-0I12", driverId: "d3", driverName: "Pedro Santos", date: "2024-01-11", fuelType: "Etanol", liters: 50, cost: 199.50, km: 67500, station: "Posto Ipiranga Sul" },
  { id: "f4", vehicleId: "v5", vehiclePlate: "MNO-3J45", driverId: "d4", driverName: "Maria Lima", date: "2024-01-13", fuelType: "Diesel", liters: 70, cost: 419.30, km: 28900, station: "Posto Texaco Norte" },
  { id: "f5", vehicleId: "v7", vehiclePlate: "STU-9L01", driverId: "d5", driverName: "José Oliveira", date: "2024-01-14", fuelType: "Diesel", liters: 55, cost: 329.45, km: 8500, station: "Posto Shell Leste" },
  { id: "f6", vehicleId: "v8", vehiclePlate: "VWX-2M34", driverId: "d6", driverName: "Fernanda Costa", date: "2024-01-09", fuelType: "Diesel", liters: 60, cost: 359.40, km: 41300, station: "Posto BR Centro" },
  { id: "f7", vehicleId: "v1", vehiclePlate: "ABC-1D23", driverId: "d1", driverName: "Carlos Silva", date: "2024-01-03", fuelType: "Diesel", liters: 62, cost: 371.38, km: 44500, station: "Posto Shell Centro" },
  { id: "f8", vehicleId: "v4", vehiclePlate: "JKL-0I12", driverId: "d3", driverName: "Pedro Santos", date: "2024-01-05", fuelType: "Gasolina", liters: 45, cost: 270.45, km: 66800, station: "Posto Ipiranga Sul" },
];

export const workOrders: WorkOrder[] = [
  { id: "w1", vehicleId: "v3", vehiclePlate: "GHI-7H89", type: "corrective", description: "Troca de embreagem", status: "in_progress", priority: "high", cost: 2800, createdAt: "2024-01-15", mechanic: "Oficina Central" },
  { id: "w2", vehicleId: "v1", vehiclePlate: "ABC-1D23", type: "preventive", description: "Revisão 50.000 km", status: "pending", priority: "medium", cost: 1200, createdAt: "2024-01-14" },
  { id: "w3", vehicleId: "v6", vehiclePlate: "PQR-6K78", type: "corrective", description: "Reparo no sistema de arrefecimento", status: "completed", priority: "high", cost: 1850, createdAt: "2024-01-10", mechanic: "Auto Mecânica Silva" },
  { id: "w4", vehicleId: "v2", vehiclePlate: "DEF-4G56", type: "preventive", description: "Troca de óleo e filtros", status: "pending", priority: "low", cost: 450, createdAt: "2024-01-16" },
  { id: "w5", vehicleId: "v5", vehiclePlate: "MNO-3J45", type: "preventive", description: "Alinhamento e balanceamento", status: "completed", priority: "low", cost: 280, createdAt: "2024-01-08", mechanic: "Pneus Express" },
];

export const notifications: Notification[] = [
  { id: "n1", type: "document", title: "CNH Vencendo", message: "A CNH de Roberto Alves vence em 30/01/2024", date: "2024-01-15", read: false },
  { id: "n2", type: "maintenance", title: "Manutenção Preventiva", message: "Veículo GHI-7H89 precisa de revisão programada", date: "2024-01-14", read: false },
  { id: "n3", type: "fuel", title: "Abastecimento Suspeito", message: "KM incompatível registrado no veículo JKL-0I12", date: "2024-01-13", read: true },
  { id: "n4", type: "alert", title: "Veículo Parado", message: "Veículo STU-9L01 está parado há mais de 4 horas", date: "2024-01-14", read: false },
  { id: "n5", type: "document", title: "CRLV Vencendo", message: "CRLV do veículo PQR-6K78 vence em 25/01/2024", date: "2024-01-12", read: true },
];

export const dashboardStats = {
  totalVehicles: 8,
  activeVehicles: 6,
  inMaintenance: 1,
  inactive: 1,
  totalDrivers: 7,
  activeDrivers: 6,
  totalFuelCost: 2591.25,
  avgConsumption: 8.7,
  pendingOrders: 2,
  completedOrders: 2,
  alertsCount: 3,
  kmTotal: 328530,
};

export const monthlyFuelData = [
  { month: "Ago", cost: 8500 },
  { month: "Set", cost: 9200 },
  { month: "Out", cost: 7800 },
  { month: "Nov", cost: 10100 },
  { month: "Dez", cost: 9800 },
  { month: "Jan", cost: 8900 },
];

export const vehicleTypeData = [
  { name: "Diesel", value: 5, fill: "hsl(252, 100%, 65%)" },
  { name: "Flex", value: 2, fill: "hsl(152, 60%, 45%)" },
  { name: "Gasolina", value: 1, fill: "hsl(38, 92%, 50%)" },
];

export interface Mechanic {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  specialties: string[];
  status: "active" | "inactive";
}

export const mechanics: Mechanic[] = [
  { id: "m1", name: "Oficina Central", cnpj: "12.345.678/0001-00", email: "central@oficina.com", phone: "(11) 3333-1111", address: "Rua das Oficinas, 100", specialties: ["Motor", "Suspensão", "Freios"], status: "active" },
  { id: "m2", name: "Auto Mecânica Silva", cnpj: "23.456.789/0001-11", email: "silva@mecanica.com", phone: "(11) 3333-2222", address: "Av. Brasil, 500", specialties: ["Elétrica", "Injeção eletrônica"], status: "active" },
  { id: "m3", name: "Pneus Express", cnpj: "34.567.890/0001-22", email: "contato@pneusexpress.com", phone: "(11) 3333-3333", address: "Rua dos Pneus, 50", specialties: ["Pneus", "Alinhamento", "Balanceamento"], status: "active" },
  { id: "m4", name: "Diesel Tech", cnpj: "45.678.901/0001-33", email: "diesel@tech.com", phone: "(11) 3333-4444", address: "Rod. Municipal km 5", specialties: ["Motor diesel", "Turbo"], status: "inactive" },
];
