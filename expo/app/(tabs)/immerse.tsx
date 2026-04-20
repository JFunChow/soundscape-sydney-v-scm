import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Footprints, Layers, MapPin } from 'lucide-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { categoryColors, soundSpots, SoundSpot } from '@/data/sound-spots';

const CESIUM_TOKEN = process.env.EXPO_PUBLIC_CESIUM_ION_TOKEN ?? '';

function buildHtml(spots: SoundSpot[], startId: string): string {
  const spotsJson = JSON.stringify(
    spots.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      color: categoryColors[s.category],
      lat: s.coordinates.latitude,
      lng: s.coordinates.longitude,
    }))
  );
  const start = spots.find((s) => s.id === startId) ?? spots[0];
  const startLat = start?.coordinates.latitude ?? -33.8688;
  const startLng = start?.coordinates.longitude ?? 151.2093;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
<link rel="stylesheet" href="https://cesium.com/downloads/cesiumjs/releases/1.121/Build/Cesium/Widgets/widgets.css" />
<script src="https://cesium.com/downloads/cesiumjs/releases/1.121/Build/Cesium/Cesium.js"></script>
<style>
  html,body,#cesiumContainer { margin:0; padding:0; width:100%; height:100%; background:#000; overflow:hidden; font-family:-apple-system,system-ui,Segoe UI,sans-serif; }
  .cesium-widget-credits, .cesium-viewer-bottom, .cesium-viewer-toolbar, .cesium-viewer-animationContainer, .cesium-viewer-timelineContainer, .cesium-viewer-fullscreenContainer { display:none !important; }
  #hint { position:absolute; top:14px; left:50%; transform:translateX(-50%); background:rgba(5,8,18,0.78); color:#2FFFE0; border:1px solid rgba(47,255,224,0.35); border-radius:999px; padding:8px 14px; font-size:11px; letter-spacing:2px; font-weight:800; z-index:10; pointer-events:none; backdrop-filter: blur(10px); }
  #reticle { position:absolute; top:50%; left:50%; width:14px; height:14px; margin:-7px 0 0 -7px; border:1.5px solid rgba(47,255,224,0.9); border-radius:50%; box-shadow:0 0 12px rgba(47,255,224,0.6); z-index:9; pointer-events:none; }
  #reticle:after { content:""; position:absolute; inset:5px; background:#2FFFE0; border-radius:50%; box-shadow:0 0 6px #2FFFE0; }
  .pop { position:absolute; bottom:20%; left:50%; transform:translateX(-50%); background:rgba(5,8,18,0.88); color:#fff; border:1px solid rgba(255,255,255,0.15); border-radius:18px; padding:14px 18px; font-size:14px; font-weight:700; z-index:20; display:none; backdrop-filter: blur(16px); max-width:80%; text-align:center; }
  .pop small { display:block; color:#8A8FB8; font-size:10px; letter-spacing:2px; margin-bottom:6px; font-weight:800; }
  .pop button { margin-top:10px; background:#2FFFE0; color:#050812; border:none; border-radius:999px; padding:8px 16px; font-weight:900; letter-spacing:1.5px; font-size:11px; }
  #joy { position:absolute; bottom:28px; left:28px; width:120px; height:120px; border-radius:60px; background:rgba(5,8,18,0.55); border:1px solid rgba(255,255,255,0.12); z-index:15; touch-action:none; backdrop-filter: blur(12px); }
  #nub { position:absolute; top:35px; left:35px; width:50px; height:50px; border-radius:25px; background:rgba(47,255,224,0.22); border:1.5px solid #2FFFE0; box-shadow:0 0 14px rgba(47,255,224,0.6); }
  #look { position:absolute; bottom:28px; right:28px; width:120px; height:120px; border-radius:60px; background:rgba(5,8,18,0.45); border:1px solid rgba(255,255,255,0.1); z-index:15; touch-action:none; color:#8A8FB8; display:flex; align-items:center; justify-content:center; font-size:9px; letter-spacing:2px; font-weight:800; backdrop-filter: blur(12px); }
  #tele { position:absolute; top:64px; left:14px; right:14px; display:flex; gap:8px; overflow-x:auto; padding-bottom:6px; z-index:12; scrollbar-width:none; }
  #tele::-webkit-scrollbar { display:none; }
  .chip { flex-shrink:0; padding:8px 12px; background:rgba(5,8,18,0.78); color:#D7DBFF; border:1px solid rgba(255,255,255,0.12); border-radius:999px; font-size:11px; font-weight:700; white-space:nowrap; backdrop-filter: blur(10px); }
  .chip .dot { display:inline-block; width:6px; height:6px; border-radius:3px; margin-right:6px; vertical-align:middle; }
</style>
</head>
<body>
<div id="cesiumContainer"></div>
<div id="hint">FIRST PERSON · TAP MARKER TO EXPLORE</div>
<div id="reticle"></div>
<div id="tele"></div>
<div id="pop" class="pop"></div>
<div id="joy"><div id="nub"></div></div>
<div id="look">LOOK</div>
<script>
(function(){
  Cesium.Ion.defaultAccessToken = ${JSON.stringify(CESIUM_TOKEN)};
  const SPOTS = ${spotsJson};
  const START = { lat: ${startLat}, lng: ${startLng} };
  const EYE_HEIGHT = 1.7;
  const post = (msg) => { try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(msg)); } catch(e){} };

  const viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: undefined,
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    infoBox: false,
    selectionIndicator: false,
    shouldAnimateSky: true,
  });
  viewer.scene.skyAtmosphere.show = true;
  viewer.scene.globe.enableLighting = true;
  viewer.scene.fog.enabled = true;
  viewer.scene.fog.density = 0.0005;
  viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;

  // Try to add Google Photorealistic 3D Tiles (via Ion asset 2275207) or Cesium OSM Buildings fallback
  (async () => {
    try {
      const tileset = await Cesium.createGooglePhotorealistic3DTileset();
      viewer.scene.primitives.add(tileset);
    } catch(e) {
      try {
        const osm = await Cesium.createOsmBuildingsAsync();
        viewer.scene.primitives.add(osm);
      } catch(e2) { console.log('tileset failed', e2); }
    }
    try {
      const terrain = await Cesium.createWorldTerrainAsync();
      viewer.terrainProvider = terrain;
    } catch(e){}
  })();

  // Place markers
  const entities = [];
  SPOTS.forEach((s) => {
    const ent = viewer.entities.add({
      id: s.id,
      name: s.name,
      position: Cesium.Cartesian3.fromDegrees(s.lng, s.lat, 30),
      billboard: undefined,
      point: {
        pixelSize: 14,
        color: Cesium.Color.fromCssColorString(s.color).withAlpha(0.95),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      label: {
        text: s.name,
        font: '600 12px -apple-system, system-ui, sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.fromCssColorString('#050812'),
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, -20),
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#050812').withAlpha(0.7),
        backgroundPadding: new Cesium.Cartesian2(8, 4),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2000),
      },
    });
    ent._spot = s;
    entities.push(ent);
  });

  // Teleport chips
  const tele = document.getElementById('tele');
  SPOTS.forEach((s) => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.innerHTML = '<span class="dot" style="background:'+s.color+'"></span>' + s.name;
    chip.onclick = () => teleport(s);
    tele.appendChild(chip);
  });

  // First-person camera state
  let heading = Cesium.Math.toRadians(0);
  let pitch = Cesium.Math.toRadians(-5);
  let longitude = START.lng;
  let latitude = START.lat;
  let groundHeight = 20;

  function updateGround() {
    try {
      const cart = Cesium.Cartographic.fromDegrees(longitude, latitude);
      const h = viewer.scene.globe.getHeight(cart);
      if (typeof h === 'number' && !isNaN(h)) groundHeight = h;
    } catch(e){}
  }

  function applyCamera() {
    updateGround();
    const pos = Cesium.Cartesian3.fromDegrees(longitude, latitude, groundHeight + EYE_HEIGHT);
    viewer.camera.setView({
      destination: pos,
      orientation: { heading: heading, pitch: pitch, roll: 0 },
    });
  }

  function teleport(s) {
    longitude = s.lng;
    latitude = s.lat;
    heading = Cesium.Math.toRadians(0);
    pitch = Cesium.Math.toRadians(-5);
    applyCamera();
  }

  applyCamera();

  // Movement
  let moveX = 0, moveY = 0; // from joystick
  const SPEED_MPS = 4.5; // walking speed
  let lastT = performance.now();

  function step() {
    const now = performance.now();
    const dt = Math.min(0.1, (now - lastT) / 1000);
    lastT = now;
    if (Math.abs(moveX) > 0.02 || Math.abs(moveY) > 0.02) {
      const dist = SPEED_MPS * dt;
      const forward = -moveY * dist;
      const strafe = moveX * dist;
      // Convert meters to deg (approx)
      const dLat = (forward * Math.cos(heading) + strafe * Math.sin(heading)) / 111320;
      const dLng = (forward * Math.sin(heading) - strafe * Math.cos(heading)) / (111320 * Math.cos(latitude * Math.PI / 180));
      latitude += dLat;
      longitude += dLng;
      applyCamera();
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  // Joystick
  const joy = document.getElementById('joy');
  const nub = document.getElementById('nub');
  let joyActive = false, joyId = null;
  function setNub(dx, dy) {
    const r = 35;
    const m = Math.min(r, Math.hypot(dx, dy));
    const a = Math.atan2(dy, dx);
    const x = Math.cos(a) * m, y = Math.sin(a) * m;
    nub.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    moveX = x / r; moveY = y / r;
  }
  joy.addEventListener('touchstart', (e) => { joyActive = true; joyId = e.changedTouches[0].identifier; e.preventDefault(); }, { passive:false });
  joy.addEventListener('touchmove', (e) => {
    if (!joyActive) return;
    const t = [...e.changedTouches].find(t => t.identifier === joyId);
    if (!t) return;
    const rect = joy.getBoundingClientRect();
    setNub(t.clientX - rect.left - 60, t.clientY - rect.top - 60);
    e.preventDefault();
  }, { passive:false });
  const joyEnd = () => { joyActive = false; joyId = null; setNub(0,0); };
  joy.addEventListener('touchend', joyEnd);
  joy.addEventListener('touchcancel', joyEnd);

  // Mouse drag on joystick (web)
  let joyMouseDown = false;
  joy.addEventListener('mousedown', (e) => { joyMouseDown = true; });
  window.addEventListener('mousemove', (e) => {
    if (!joyMouseDown) return;
    const rect = joy.getBoundingClientRect();
    setNub(e.clientX - rect.left - 60, e.clientY - rect.top - 60);
  });
  window.addEventListener('mouseup', () => { if (joyMouseDown) { joyMouseDown = false; setNub(0,0); } });

  // Look pad
  const look = document.getElementById('look');
  let lookId = null, lastLook = null;
  look.addEventListener('touchstart', (e) => { lookId = e.changedTouches[0].identifier; lastLook = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }; e.preventDefault(); }, { passive:false });
  look.addEventListener('touchmove', (e) => {
    const t = [...e.changedTouches].find(t => t.identifier === lookId);
    if (!t || !lastLook) return;
    const dx = t.clientX - lastLook.x, dy = t.clientY - lastLook.y;
    heading += dx * 0.005;
    pitch = Math.max(-Math.PI/2+0.1, Math.min(Math.PI/2-0.1, pitch - dy * 0.005));
    lastLook = { x: t.clientX, y: t.clientY };
    applyCamera();
    e.preventDefault();
  }, { passive:false });
  look.addEventListener('touchend', () => { lookId = null; lastLook = null; });

  let lookMouseDown = false, lastMouseLook = null;
  look.addEventListener('mousedown', (e) => { lookMouseDown = true; lastMouseLook = { x: e.clientX, y: e.clientY }; });
  window.addEventListener('mousemove', (e) => {
    if (!lookMouseDown || !lastMouseLook) return;
    const dx = e.clientX - lastMouseLook.x, dy = e.clientY - lastMouseLook.y;
    heading += dx * 0.005;
    pitch = Math.max(-Math.PI/2+0.1, Math.min(Math.PI/2-0.1, pitch - dy * 0.005));
    lastMouseLook = { x: e.clientX, y: e.clientY };
    applyCamera();
  });
  window.addEventListener('mouseup', () => { lookMouseDown = false; lastMouseLook = null; });

  // Keyboard (web)
  const keys = {};
  window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
  window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
  setInterval(() => {
    const mx = (keys['d']?1:0) - (keys['a']?1:0);
    const my = (keys['s']?1:0) - (keys['w']?1:0);
    if (mx || my) { moveX = mx; moveY = my; }
    else if (!joyActive && !joyMouseDown) { moveX = 0; moveY = 0; }
  }, 50);

  // Click/tap on entity
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((click) => {
    const picked = viewer.scene.pick(click.position);
    if (picked && picked.id && picked.id._spot) {
      const s = picked.id._spot;
      showPop(s);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  function showPop(s) {
    const pop = document.getElementById('pop');
    pop.innerHTML = '<small>' + s.category.toUpperCase() + '</small>' + s.name + '<br/><button onclick="window.__open(\\''+s.id+'\\')">OPEN DETAILS</button>';
    pop.style.display = 'block';
  }
  window.__open = (id) => { post({ type: 'open', id }); };
  document.addEventListener('click', (e) => {
    const pop = document.getElementById('pop');
    if (pop.style.display === 'block' && !pop.contains(e.target)) pop.style.display = 'none';
  });

  post({ type: 'ready' });
})();
</script>
</body>
</html>`;
}

export default function ImmerseScreen() {
  const insets = useSafeAreaInsets();
  const webRef = useRef<WebView>(null);
  const [selectedId, setSelectedId] = useState<string>(soundSpots[0]?.id ?? '');
  const [showList, setShowList] = useState<boolean>(false);

  const html = useMemo(() => buildHtml(soundSpots, selectedId), [selectedId]);

  const onMessage = useCallback((e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg?.type === 'open' && typeof msg.id === 'string') {
        router.push(`/spots/${msg.id}`);
      }
    } catch {}
  }, []);

  const teleport = useCallback((id: string) => {
    setSelectedId(id);
    setShowList(false);
  }, []);

  const missingToken = !CESIUM_TOKEN;

  return (
    <View style={styles.screen}>
      <View style={StyleSheet.absoluteFill}>
        {missingToken ? (
          <View style={styles.fallback}>
            <LinearGradient colors={['#050812', '#0E0B28', '#1B0B2E']} style={StyleSheet.absoluteFill} />
            <Text style={styles.fallbackTitle}>CESIUM TOKEN MISSING</Text>
            <Text style={styles.fallbackText}>Set EXPO_PUBLIC_CESIUM_ION_TOKEN to enable the immersive first-person map.</Text>
          </View>
        ) : (
          <WebView
            ref={webRef}
            originWhitelist={["*"]}
            source={{ html, baseUrl: 'https://cesium.com' }}
            onMessage={onMessage}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            style={styles.web}
            {...(Platform.OS === 'android' ? { mixedContentMode: 'always' as const } : {})}
          />
        )}
      </View>

      <LinearGradient
        colors={['rgba(5,8,18,0.85)', 'rgba(5,8,18,0)']}
        style={[styles.topVignette, { height: insets.top + 120 }]}
        pointerEvents="none"
      />

      <View style={[styles.topBar, { top: insets.top + 10 }]} pointerEvents="box-none">
        <Pressable onPress={() => router.back()} style={styles.iconBtn} testID="back-button">
          <ArrowLeft color={Colors.cyan} size={16} />
        </Pressable>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>WALK MODE</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.subtitle} numberOfLines={1}>
            {soundSpots.find((s) => s.id === selectedId)?.name ?? 'Sydney'}
          </Text>
        </View>
        <Pressable onPress={() => setShowList((v) => !v)} style={styles.iconBtn} testID="list-button">
          <Layers color={Colors.cyan} size={16} />
        </Pressable>
      </View>

      {showList ? (
        <View style={[styles.sheet, { top: insets.top + 70, maxHeight: 360 }]}>
          <Text style={styles.sheetTitle}>TELEPORT TO</Text>
          <ScrollView contentContainerStyle={styles.sheetList}>
            {soundSpots.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => teleport(s.id)}
                style={[styles.sheetRow, selectedId === s.id && styles.sheetRowActive]}
              >
                <View style={[styles.sheetDot, { backgroundColor: categoryColors[s.category], shadowColor: categoryColors[s.category] }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetName} numberOfLines={1}>{s.name}</Text>
                  <Text style={styles.sheetMeta}>{s.category}</Text>
                </View>
                <MapPin size={14} color={Colors.mist} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={[styles.hudFooter, { bottom: 100 + insets.bottom }]} pointerEvents="none">
        <Footprints color={Colors.cyan} size={14} />
        <Text style={styles.hudText}>LEFT JOYSTICK · WALK   ·   RIGHT PAD · LOOK</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  web: { flex: 1, backgroundColor: '#000' },
  topVignette: { position: 'absolute', top: 0, left: 0, right: 0 },
  topBar: {
    position: 'absolute',
    left: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5,8,18,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(47,255,224,0.3)',
  },
  titleWrap: { flex: 1, alignItems: 'center' },
  title: { color: Colors.cyan, fontSize: 14, fontWeight: '900' as const, letterSpacing: 5 },
  titleUnderline: { width: 30, height: 1.5, backgroundColor: Colors.cyan, opacity: 0.6, marginTop: 3 },
  subtitle: { color: Colors.mist, fontSize: 10, fontWeight: '700' as const, letterSpacing: 1.5, marginTop: 4 },
  sheet: {
    position: 'absolute',
    left: 18,
    right: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(5,8,18,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  sheetTitle: {
    color: Colors.mist,
    fontSize: 10,
    fontWeight: '900' as const,
    letterSpacing: 2.5,
    padding: 14,
    paddingBottom: 8,
  },
  sheetList: { paddingBottom: 12 },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sheetRowActive: { backgroundColor: 'rgba(47,255,224,0.08)' },
  sheetDot: { width: 8, height: 8, borderRadius: 4, shadowOpacity: 1, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } },
  sheetName: { color: Colors.white, fontSize: 13, fontWeight: '700' as const },
  sheetMeta: { color: Colors.mist, fontSize: 10, fontWeight: '600' as const, letterSpacing: 1, marginTop: 2 },
  hudFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  hudText: { color: Colors.mist, fontSize: 9, fontWeight: '800' as const, letterSpacing: 2 },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  fallbackTitle: { color: Colors.cyan, fontSize: 14, fontWeight: '900' as const, letterSpacing: 4 },
  fallbackText: { color: Colors.cloud, fontSize: 13, textAlign: 'center', lineHeight: 19 },
});
