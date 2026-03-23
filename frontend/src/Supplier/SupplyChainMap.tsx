import { useState } from "react";
import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { AlertCircle, Factory, Truck } from "lucide-react";

const MAPBOX_TOKEN = "pk.eyJ1IjoibW91c3QxYW0iLCJhIjoiY21teGo1NWZ3MzNheDJvcHM0eTB4OXNqayJ9.cuH343hAl-_mIvDhKfUVlA";

const nodes = [
  { id: 1, lat: 28.6, lng: 77.2, type: "factory", risk: "low", name: "India Supplier" },
  { id: 2, lat: 50.1, lng: 8.6, type: "transit", risk: "medium", name: "EU Transit" },
  { id: 3, lat: 37.7, lng: -122.4, type: "disruption", risk: "high", name: "US Port" },
];

export default function SupplyChainDashboard() {
  const [selected, setSelected] = useState(nodes[0]);

  return (
    <div className="h-screen flex flex-col bg-[#f5f7f6]">

      {/* TOP BAR */}
      <div className="h-14 bg-white flex items-center justify-between px-6 shadow">
        <h1 className="font-semibold">Network Planner Dashboard</h1>
        <div className="flex gap-3 text-sm">
          <Filter label="Current Plan" />
          <Filter label="All Items" />
          <Filter label="All Sites" />
          <Filter label="Current Quarter" />
        </div>
      </div>

      {/* MAP AREA */}
      <div className="relative flex-1">

        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={{ latitude: 20, longitude: 0, zoom: 2 }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          style={{ width: "100%", height: "100%" }}
        >

          {/* MARKERS */}
          {nodes.map((n) => (
            <Marker key={n.id} latitude={n.lat} longitude={n.lng}>
              <Node node={n} onClick={() => setSelected(n)} />
            </Marker>
          ))}
        </Map>

        {/* FLOATING KPI BAR */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur rounded-2xl shadow px-6 py-4 flex gap-8">
          <KPI label="Days of Supply" value="12" />
          <KPI label="Service Level" value="74%" />
          <KPI label="Utilization" value="78%" />
          <KPI label="Margin" value="34%" />
          <KPI label="Revenue" value="$40.3M" />
        </div>

        {/* FLOATING CARD */}
        <div className="absolute right-6 top-20 bg-white rounded-2xl shadow-xl p-5 w-80">
          <p className="text-xs text-red-500 mb-1">Critical</p>
          <h2 className="font-semibold text-lg">{selected.name}</h2>

          <div className="mt-3">
            <p className="text-sm text-gray-500">Service Impact</p>
            <p className="text-3xl font-bold text-red-500">-25%</p>
          </div>

          <button className="mt-4 w-full bg-black text-white py-2 rounded-lg">
            Investigate
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white p-6 border-t grid grid-cols-3 gap-6">

        {/* TABLE */}
        <div className="col-span-2">
          <h2 className="font-semibold mb-4">My Exceptions</h2>

          <table className="w-full text-sm">
            <thead className="text-gray-500">
              <tr>
                <th className="text-left">Exception</th>
                <th>Description</th>
                <th>Status</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              <Row name="Supplier Shutdown" status="Critical" impact="-25%" />
              <Row name="Capacity Reduced" status="Medium" impact="-10%" />
              <Row name="Delay Risk" status="Low" impact="-5%" />
            </tbody>
          </table>
        </div>

        {/* STATS */}
        <div>
          <h2 className="font-semibold mb-4">Exception Stats</h2>
          <Stat label="Critical" value="1" color="text-red-500" />
          <Stat label="Major" value="9" color="text-yellow-500" />
          <Stat label="Minor" value="43" color="text-green-500" />
        </div>

      </div>
    </div>
  );
}

/* COMPONENTS */

function Node({ node, onClick }) {
  const color =
    node.risk === "high"
      ? "bg-red-500"
      : node.risk === "medium"
      ? "bg-yellow-400"
      : "bg-green-400";

  const icon =
    node.type === "factory"
      ? <Factory />
      : node.type === "transit"
      ? <Truck />
      : <AlertCircle />;

  return (
    <div className="relative" onClick={onClick}>
      {/* Glow */}
      <div className={`absolute w-16 h-16 rounded-full ${color} opacity-20 animate-ping`} />

      {/* Core */}
      <div className={`relative p-3 rounded-full shadow-xl cursor-pointer ${color} text-white`}>
        {icon}
      </div>
    </div>
  );
}

function KPI({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function Filter({ label }) {
  return (
    <div className="bg-gray-100 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-200">
      {label}
    </div>
  );
}

function Row({ name, status, impact }) {
  return (
    <tr className="border-t">
      <td className="py-2">{name}</td>
      <td>Issue detected</td>
      <td className="text-gray-500">{status}</td>
      <td className="text-red-500">{impact}</td>
    </tr>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="flex justify-between mb-2">
      <span>{label}</span>
      <span className={`${color} font-bold`}>{value}</span>
    </div>
  );
}
