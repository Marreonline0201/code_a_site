"use client";

import { useEffect, useMemo, useState } from "react";
import * as L from "leaflet";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import {
  getApproximateCoveragePoint,
  getMarkerRadius,
  getStateCenter,
  type WaterQualityMapSystem,
} from "@/lib/epa/coverage-map";

interface Props {
  systems: WaterQualityMapSystem[];
  stateCode: string;
}

interface TileProviderConfig {
  url: string;
  attribution: string;
  subdomains?: string[];
}

const statusColors = {
  alert: "#ef4444",
  watch: "#f59e0b",
  good: "#22c55e",
};

function getSystemPosition(system: WaterQualityMapSystem, index: number, total: number): [number, number] {
  if (Number.isFinite(system.latitude) && Number.isFinite(system.longitude)) {
    return [system.latitude, system.longitude];
  }

  return getApproximateCoveragePoint(system.pwsid, system.state, index, total);
}

function FitToSystems({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      return;
    }

    map.invalidateSize();

    if (points.length === 1) {
      map.setView(points[0], 9, { animate: false });
      return;
    }

    const bounds = L.latLngBounds(points);
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.18), { animate: false, maxZoom: 11 });
    }
  }, [map, points]);

  return null;
}

function MarkerLegend() {
  return (
    <div className="absolute left-3 bottom-3 z-[500] rounded-md border border-white/15 bg-black/40 px-3 py-2 text-[11px] text-white/80 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <span>Geocoded</span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full border border-white/30 bg-white/20" />
        <span>Approximate fallback</span>
      </div>
    </div>
  );
}

export default function WaterQualityMapInner({ systems, stateCode }: Props) {
  const [selectedPwsid, setSelectedPwsid] = useState<string | null>(null);
  const [tileProviderIndex, setTileProviderIndex] = useState(0);

  const center = getStateCenter(stateCode);
  const tileProviders: TileProviderConfig[] = [
    {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: ["a", "b", "c"],
    },
    {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, HERE, Garmin, Intermap, increment P Corp., GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), NOSTRA, &copy; OpenStreetMap contributors, and the GIS User Community",
    },
  ] as const;
  const tileProvider = tileProviders[tileProviderIndex];

  const positionedSystems = useMemo(
    () =>
      systems.map((system, index) => {
        const position = getSystemPosition(system, index, systems.length);
        const isApproximate =
          system.coordinateSource === "approximate" ||
          !Number.isFinite(system.latitude) ||
          !Number.isFinite(system.longitude);

        return {
          system,
          position,
          isApproximate,
        };
      }),
    [systems],
  );

  const selected = selectedPwsid
    ? systems.find((system) => system.pwsid === selectedPwsid) ?? null
    : null;

  return (
    <div className="relative h-[400px] w-full overflow-hidden bg-[#0a1628]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.2),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(14,116,144,0.22),transparent_55%),linear-gradient(180deg,#0c1f34_0%,#0a1628_100%)]" />
      <div className="absolute inset-0 opacity-20 [background-size:40px_40px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)]" />

      <MapContainer
        center={center}
        zoom={7}
        className="relative z-10 h-full w-full"
        scrollWheelZoom={false}
        zoomControl
      >
        <TileLayer
          attribution={tileProvider.attribution}
          url={tileProvider.url}
          subdomains={tileProvider.subdomains}
          eventHandlers={{
            tileerror: () => {
              setTileProviderIndex((current) => {
                if (current >= tileProviders.length - 1) {
                  return current;
                }
                return current + 1;
              });
            },
          }}
        />
        <FitToSystems points={positionedSystems.map(({ position }) => position)} />

        {positionedSystems.map(({ system, position, isApproximate }) => {
          const color = statusColors[system.status];
          const selectedMarker = selectedPwsid === system.pwsid;
          const radius = getMarkerRadius(system.populationServed) + (selectedMarker ? 2 : 0);

          return (
            <CircleMarker
              key={system.pwsid}
              center={position}
              radius={radius}
              eventHandlers={{
                click: () => setSelectedPwsid(system.pwsid),
              }}
              pathOptions={{
                color,
                weight: selectedMarker ? 3 : 2,
                fillColor: color,
                fillOpacity: isApproximate ? 0.6 : selectedMarker ? 0.95 : 0.82,
                opacity: isApproximate ? 0.72 : 1,
                dashArray: isApproximate ? "4 4" : undefined,
              }}
            >
              <Tooltip direction="top" offset={[0, -2]} opacity={1} sticky>
                <div className="text-xs">
                  <div className="font-semibold">{system.name}</div>
                  <div className="opacity-80">
                    {system.coordinateLabel ?? system.citiesServed ?? system.countiesServed ?? "Unknown area"}
                  </div>
                  {isApproximate ? <div className="opacity-70">Approximate fallback</div> : null}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <div className="absolute left-3 top-3 z-[500] rounded-md border border-white/15 bg-black/30 px-2 py-1 text-[11px] text-white/75 backdrop-blur-sm">
        Interactive coverage map
      </div>

      <MarkerLegend />

      <div className="absolute right-3 bottom-3 z-[500] w-[min(92%,360px)] rounded-lg border border-white/15 bg-[#071322]/92 p-3 text-white shadow-xl backdrop-blur-sm">
        {selected ? (
          <div className="space-y-1.5 text-xs">
            <h4 className="text-sm font-semibold text-white">{selected.name}</h4>
            <p className="text-white/70">
              {selected.coordinateLabel ?? selected.citiesServed ?? selected.countiesServed ?? "Unknown area"} | {selected.source}
            </p>
            <p className="text-white/70">
              {selected.coordinateSource === "approximate" ? "Approximate fallback pin" : "Geocoded pin"}
            </p>
            <p className="text-white/70">
              Population: {selected.populationServed?.toLocaleString() ?? "N/A"}
            </p>
            <p className="text-white/70">Violations (3yr): {selected.rulesViolated3yr}</p>
            {selected.leadViolation ? (
              <p className="font-semibold text-red-300">Lead violation detected</p>
            ) : null}
            {selected.copperViolation ? (
              <p className="font-semibold text-red-300">Copper violation detected</p>
            ) : null}
            <a
              href={selected.detailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block pt-1 text-sky-300 hover:text-sky-200 hover:underline"
            >
              View EPA report
            </a>
          </div>
        ) : (
          <p className="text-xs text-white/75">Select a marker to view system details.</p>
        )}
      </div>
    </div>
  );
}
