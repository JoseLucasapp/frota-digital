import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Car, Activity, Clock, Navigation } from "lucide-react";
import { vehicles } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";

const activeVehicles = vehicles.filter((v) => v.lat && v.lng);

const AdminTracking = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedVehicle = activeVehicles.find((v) => v.id === selected);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Rastreamento</h1>
        <p className="text-muted-foreground text-lg">{activeVehicles.length} veículos em campo</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <div className="lg:col-span-2 glass-card overflow-hidden relative" style={{ minHeight: 500 }}>
          <div className="absolute inset-0 bg-secondary flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                <MapPin className="w-10 h-10 text-primary-foreground" />
              </div>
              <p className="text-foreground text-xl font-semibold">Mapa em Tempo Real</p>
              <p className="text-muted-foreground mt-2">Integração com Google Maps / Leaflet</p>
              <div className="mt-6 grid grid-cols-3 gap-4 max-w-sm mx-auto">
                {activeVehicles.slice(0, 6).map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelected(v.id)}
                    className={`p-3 rounded-xl text-center transition-all ${
                      selected === v.id ? "gradient-primary text-primary-foreground" : "bg-card hover:bg-accent"
                    }`}
                  >
                    <Car className="w-5 h-5 mx-auto mb-1" />
                    <p className="text-xs font-mono font-bold">{v.plate.slice(0, 7)}</p>
                    <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${v.moving ? "bg-success" : "bg-warning"}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle List / Details */}
        <div className="space-y-4">
          {selectedVehicle ? (
            <motion.div key={selectedVehicle.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">{selectedVehicle.brand} {selectedVehicle.model}</h3>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
              </div>
              <p className="font-mono text-xl font-bold text-primary">{selectedVehicle.plate}</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                  <Activity className={`w-5 h-5 ${selectedVehicle.moving ? "text-success" : "text-warning"}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium text-foreground">{selectedVehicle.moving ? "Em movimento" : "Parado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                  <Navigation className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Motorista</p>
                    <p className="font-medium text-foreground">{selectedVehicle.driver || "Sem motorista"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                  <Clock className="w-5 h-5 text-info" />
                  <div>
                    <p className="text-sm text-muted-foreground">KM Atual</p>
                    <p className="font-medium text-foreground">{selectedVehicle.km.toLocaleString("pt-BR")} km</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="glass-card p-4">
              <h3 className="text-lg font-semibold text-foreground mb-3">Veículos em Campo</h3>
              <p className="text-sm text-muted-foreground mb-4">Selecione um veículo para ver detalhes</p>
            </div>
          )}

          <div className="space-y-2">
            {activeVehicles.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelected(v.id)}
                className={`w-full glass-card p-4 flex items-center gap-3 text-left transition-all hover:border-primary/50 ${
                  selected === v.id ? "border-primary ring-1 ring-primary" : ""
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${v.moving ? "bg-success" : "bg-warning"}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{v.brand} {v.model}</p>
                  <p className="text-sm text-muted-foreground font-mono">{v.plate}</p>
                </div>
                <Badge className={v.moving ? "bg-success/20 text-success border-0" : "bg-warning/20 text-warning border-0"}>
                  {v.moving ? "Movendo" : "Parado"}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminTracking;
