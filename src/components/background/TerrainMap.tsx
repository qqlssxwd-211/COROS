import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { INITIAL_MAP_VIEW, TRAIL_1_COORDS } from '../../lib/constants';

export interface TerrainMapHandle {
  resetView: () => void;
}

const TerrainMap = forwardRef<TerrainMapHandle>(function TerrainMap(_props, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const frameRef = useRef<number>(0);
  const animState = useRef({ start: 0, lastInteraction: 0, userInteracting: false, paused: false });

  useImperativeHandle(ref, () => ({
    resetView: () => {
      const map = mapRef.current;
      if (!map) return;
      animState.current.paused = true;
      animState.current.lastInteraction = performance.now();
      map.flyTo({ center: INITIAL_MAP_VIEW.center, zoom: INITIAL_MAP_VIEW.zoom, pitch: INITIAL_MAP_VIEW.pitch, bearing: INITIAL_MAP_VIEW.bearing, duration: 1800 });
      setTimeout(() => { animState.current.paused = false; }, 7000);
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
      center: INITIAL_MAP_VIEW.center,
      zoom: INITIAL_MAP_VIEW.zoom,
      pitch: INITIAL_MAP_VIEW.pitch,
      bearing: INITIAL_MAP_VIEW.bearing,
      antialias: true,
      attributionControl: false,
      maxPitch: 75,
      renderWorldCopies: false,
      dragPan: true,
      dragRotate: true,
      touchZoomRotate: true,
    });
    mapRef.current = map;

    // Track user interaction
    map.on('mousedown', () => { animState.current.userInteracting = true; });
    map.on('mouseup', () => { setTimeout(() => { animState.current.userInteracting = false; }, 300); });
    map.on('touchstart', () => { animState.current.userInteracting = true; });
    map.on('touchend', () => { setTimeout(() => { animState.current.userInteracting = false; }, 300); });
    map.on('movestart', (e) => {
      if (e.originalEvent) animState.current.lastInteraction = performance.now();
    });

    map.on('load', () => {
      // Single trail (green)
      map.addSource('trail-1', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: TRAIL_1_COORDS } } });
      map.addLayer({ id: 'trail-1-line', type: 'line', source: 'trail-1', paint: { 'line-color': '#4ade80', 'line-width': 2.5, 'line-opacity': 0.9 } });
      map.addLayer({ id: 'trail-1-glow', type: 'line', source: 'trail-1', paint: { 'line-color': '#4ade80', 'line-width': 7, 'line-opacity': 0.15, 'line-blur': 2 } });

      // Animated dot
      map.addSource('dot-1', { type: 'geojson', data: { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: TRAIL_1_COORDS[0] } }] } });
      map.addLayer({ id: 'dot-1-layer', type: 'circle', source: 'dot-1', paint: { 'circle-radius': 5, 'circle-color': '#4ade80', 'circle-opacity': 0.95, 'circle-stroke-width': 2, 'circle-stroke-color': '#000', 'circle-stroke-opacity': 0.6 } });

      // Animation loop
      animState.current.start = performance.now();

      function tick(now: number) {
        const s = animState.current;
        const elapsed = (now - s.start) / 1000;

        // Auto-rotate when idle and not paused
        if (!s.paused && !s.userInteracting && now - s.lastInteraction > 5000) {
          map.setBearing((INITIAL_MAP_VIEW.bearing + elapsed * 1.2) % 360);
          map.setPitch(52 + Math.sin(elapsed * 0.10) * 10);
        }

        // Move dot along trail
        const t = (elapsed * 0.0048) % 1;
        const idx = Math.floor(t * (TRAIL_1_COORDS.length - 1));
        const next = Math.min(idx + 1, TRAIL_1_COORDS.length - 1);
        const frac = (t * (TRAIL_1_COORDS.length - 1)) - idx;
        const lng = TRAIL_1_COORDS[idx][0] + (TRAIL_1_COORDS[next][0] - TRAIL_1_COORDS[idx][0]) * frac;
        const lat = TRAIL_1_COORDS[idx][1] + (TRAIL_1_COORDS[next][1] - TRAIL_1_COORDS[idx][1]) * frac;
        (map.getSource('dot-1') as maplibregl.GeoJSONSource)?.setData({
          type: 'FeatureCollection',
          features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [lng, lat] } }],
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

  return <div ref={containerRef} className="fixed inset-0 z-0" style={{ cursor: 'grab' }} />;
});

export default TerrainMap;
