import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { INITIAL_MAP_VIEW, TRAIL_1_COORDS, TRAIL_2_COORDS } from '../../lib/constants';

export interface TerrainMapHandle {
  resetView: () => void;
}

const TerrainMap = forwardRef<TerrainMapHandle>(function TerrainMap(_props, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const frameRef = useRef<number>(0);
  const dotOffsets = useRef([0, 0]);
  const interacting = useRef({ active: false, last: 0 });

  useImperativeHandle(ref, () => ({
    resetView: () => {
      mapRef.current?.flyTo({ ...INITIAL_MAP_VIEW, duration: 2200 });
      interacting.current = { active: false, last: 0 };
    },
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          'terrain-dem': {
            type: 'raster-dem',
            tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
            tileSize: 256, maxzoom: 14, encoding: 'terrarium',
          },
          'satellite': {
            type: 'raster',
            tiles: ['https://webst04.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'],
            tileSize: 256, maxzoom: 18,
          },
        },
        layers: [{ id: 'satellite-layer', type: 'raster', source: 'satellite' }],
        terrain: { source: 'terrain-dem', exaggeration: 1.6 },
      },
      ...INITIAL_MAP_VIEW,
      antialias: true,
      attributionControl: false,
      maxPitch: 75,
      renderWorldCopies: false,
    });
    mapRef.current = map;

    map.on('movestart', (e) => { if (e.originalEvent) { interacting.current.active = true; } });
    map.on('moveend', (e) => { if (e.originalEvent) { interacting.current.last = performance.now(); interacting.current.active = false; } });
    map.on('mouseleave', () => { interacting.current.active = false; });

    map.on('load', () => {
      // Trail 1 (green)
      map.addSource('trail-1', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: TRAIL_1_COORDS } } });
      map.addLayer({ id: 'trail-1-line', type: 'line', source: 'trail-1', paint: { 'line-color': '#4ade80', 'line-width': 2.5, 'line-opacity': 0.9 } });
      map.addLayer({ id: 'trail-1-glow', type: 'line', source: 'trail-1', paint: { 'line-color': '#4ade80', 'line-width': 7, 'line-opacity': 0.15, 'line-blur': 2 } });

      // Trail 2 (yellow)
      map.addSource('trail-2', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: TRAIL_2_COORDS } } });
      map.addLayer({ id: 'trail-2-line', type: 'line', source: 'trail-2', paint: { 'line-color': '#facc15', 'line-width': 2.5, 'line-opacity': 0.9 } });
      map.addLayer({ id: 'trail-2-glow', type: 'line', source: 'trail-2', paint: { 'line-color': '#facc15', 'line-width': 7, 'line-opacity': 0.15, 'line-blur': 2 } });

      // Animated dots
      [{ id: 'dot-1', coords: TRAIL_1_COORDS, color: '#4ade80' }, { id: 'dot-2', coords: TRAIL_2_COORDS, color: '#facc15' }]
        .forEach(({ id, coords, color }) => {
          map.addSource(id, { type: 'geojson', data: { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: coords[0] } }] } });
          map.addLayer({ id: `${id}-layer`, type: 'circle', source: id, paint: { 'circle-radius': 5, 'circle-color': color, 'circle-opacity': 0.95, 'circle-stroke-width': 2, 'circle-stroke-color': '#000', 'circle-stroke-opacity': 0.6 } });
        });

      // Animation loop: auto-rotate, dot movement
      const start = performance.now();
      function tick(now: number) {
        const elapsed = (now - start) / 1000;
        const { active, last } = interacting.current;
        if (!active && now - last > 5000) {
          map.setBearing((INITIAL_MAP_VIEW.bearing + elapsed * 1.2) % 360);
          map.setPitch(52 + Math.sin(elapsed * 0.10) * 10);
        }

        dotOffsets.current[0] = (elapsed * 0.0048) % 1;
        dotOffsets.current[1] = (elapsed * 0.0060) % 1;

        [TRAIL_1_COORDS, TRAIL_2_COORDS].forEach((trail, i) => {
          const t = dotOffsets.current[i] * (trail.length - 1);
          const idx = Math.floor(t);
          const next = Math.min(idx + 1, trail.length - 1);
          const frac = t - idx;
          const lng = trail[idx][0] + (trail[next][0] - trail[idx][0]) * frac;
          const lat = trail[idx][1] + (trail[next][1] - trail[idx][1]) * frac;
          const src = map.getSource(`dot-${i + 1}`) as maplibregl.GeoJSONSource | undefined;
          src?.setData({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [lng, lat] } }] });
        });

        frameRef.current = requestAnimationFrame(tick);
      }
      frameRef.current = requestAnimationFrame(tick);
    });

    const handleResize = () => map.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      map.remove();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 z-0" />;
});

export default TerrainMap;
