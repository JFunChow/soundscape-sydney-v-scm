//
//  WalkView.swift
//  SoundscapeSydney
//
//  Port of expo/app/(tabs)/immerse.tsx — first-person walkable 3D Sydney
//  (Cesium.js in a WKWebView), with joystick walk, look pad, teleport chips
//  and tap-marker-to-open-detail.
//

import SwiftUI
import WebKit

struct WalkPaneView: View {
    private static let cesiumToken = Config.EXPO_PUBLIC_CESIUM_ION_TOKEN

    @State private var selectedId = SpotCatalog.spots.first?.id ?? ""
    @State private var showList = false
    @State private var routeId: String?

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            if Self.cesiumToken.isEmpty {
                fallback
            } else {
                CesiumWebView(
                    html: buildHTML(spots: SpotCatalog.spots, startId: selectedId, token: Self.cesiumToken),
                    onOpenSpot: { id in routeId = id }
                )
                .ignoresSafeArea()
            }

            // top vignette
            LinearGradient(
                colors: [Color(hex: "#050812").opacity(0.85), .clear],
                startPoint: .top, endPoint: .bottom
            )
            .frame(height: 160)
            .frame(maxHeight: .infinity, alignment: .top)
            .allowsHitTesting(false)

            VStack {
                topBar
                Spacer()
                HStack(spacing: 8) {
                    Image(systemName: "figure.walk")
                        .font(.system(size: 13, weight: .semibold))
                    Text("LEFT JOYSTICK · WALK   ·   RIGHT PAD · LOOK")
                        .font(.system(size: 9, weight: .heavy))
                        .tracking(2)
                }
                .foregroundStyle(Theme.mist)
                .padding(.bottom, 110)
            }

            if showList {
                teleportSheet
                    .padding(.horizontal, 18)
                    .frame(maxHeight: .infinity, alignment: .top)
                    .padding(.top, 70)
                    .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .navigationDestination(item: $routeId) { id in
            if let spot = SpotCatalog.spot(id: id) {
                SpotDetailView(spot: spot)
            }
        }
    }

    private var fallback: some View {
        ZStack {
            Theme.deepNight.ignoresSafeArea()
            VStack(spacing: 12) {
                Text("CESIUM TOKEN MISSING")
                    .font(.system(size: 14, weight: .black))
                    .tracking(4)
                    .foregroundStyle(Theme.cyan)
                Text("Set EXPO_PUBLIC_CESIUM_ION_TOKEN to enable the immersive first-person map.")
                    .font(.system(size: 13))
                    .foregroundStyle(Theme.cloud)
                    .multilineTextAlignment(.center)
            }
            .padding(40)
        }
    }

    private var topBar: some View {
        HStack(spacing: 12) {
            iconButton("figure.walk") {}
            VStack(spacing: 3) {
                Text("WALK MODE")
                    .font(.system(size: 14, weight: .black))
                    .tracking(5)
                    .foregroundStyle(Theme.cyan)
                Rectangle()
                    .fill(Theme.cyan.opacity(0.6))
                    .frame(width: 30, height: 1.5)
                Text(SpotCatalog.spot(id: selectedId)?.name ?? "Sydney")
                    .font(.system(size: 10, weight: .bold))
                    .tracking(1.5)
                    .foregroundStyle(Theme.mist)
                    .lineLimit(1)
            }
            iconButton("square.on.square") { withAnimation { showList.toggle() } }
        }
        .padding(.horizontal, 18)
        .padding(.top, 8)
    }

    private func iconButton(_ systemImage: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: systemImage)
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(Theme.cyan)
                .frame(width: 40, height: 40)
                .background(Color(hex: "#050812").opacity(0.75))
                .overlay(Circle().strokeBorder(Theme.cyan.opacity(0.3)))
                .clipShape(Circle())
        }
    }

    private var teleportSheet: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("TELEPORT TO")
                .font(.system(size: 10, weight: .black))
                .tracking(2.5)
                .foregroundStyle(Theme.mist)
                .padding(14)
                .padding(.bottom, 8)
            ScrollView {
                VStack(spacing: 0) {
                    ForEach(SpotCatalog.spots) { spot in
                        Button {
                            selectedId = spot.id
                            showList = false
                        } label: {
                            HStack(spacing: 12) {
                                Circle()
                                    .fill(spot.category.color)
                                    .frame(width: 8, height: 8)
                                    .shadow(color: spot.category.color, radius: 6)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(spot.name)
                                        .font(.system(size: 13, weight: .bold))
                                        .foregroundStyle(Theme.white)
                                        .lineLimit(1)
                                    Text(spot.category.rawValue)
                                        .font(.system(size: 10, weight: .semibold))
                                        .tracking(1)
                                        .foregroundStyle(Theme.mist)
                                }
                                Spacer()
                                Image(systemName: "mappin")
                                    .font(.system(size: 13))
                                    .foregroundStyle(Theme.mist)
                            }
                            .padding(.horizontal, 14)
                            .padding(.vertical, 10)
                            .background(selectedId == spot.id ? Theme.cyan.opacity(0.08) : .clear)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(.bottom, 12)
        }
        .background(Color(hex: "#050812").opacity(0.94))
        .overlay(RoundedRectangle(cornerRadius: 20).strokeBorder(Color.white.opacity(0.12)))
        .clipShape(RoundedRectangle(cornerRadius: 20))
    }

    // MARK: - HTML (cloned from the Expo app's Cesium scene)

    private func buildHTML(spots: [SoundSpot], startId: String, token: String) -> String {
        let spotsJson: String = {
            let array: [[String: Any]] = spots.map {
                [
                    "id": $0.id,
                    "name": $0.name,
                    "category": $0.category.rawValue,
                    "color": $0.category.colorHex,
                    "lat": $0.coordinates.latitude,
                    "lng": $0.coordinates.longitude,
                ]
            }
            guard let data = try? JSONSerialization.data(withJSONObject: array),
                  let string = String(data: data, encoding: .utf8) else { return "[]" }
            return string
        }()

        let start = spots.first { $0.id == startId } ?? spots.first
        let startLat = start?.coordinates.latitude ?? -33.8688
        let startLng = start?.coordinates.longitude ?? 151.2093

        return """
<!doctype html>
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
  Cesium.Ion.defaultAccessToken = \(token.jsonEncoded);
  const SPOTS = \(spotsJson);
  const START = { lat: \(startLat), lng: \(startLng) };
  const EYE_HEIGHT = 1.7;
  const post = (msg) => { try { window.webkit && window.webkit.messageHandlers.walk && window.webkit.messageHandlers.walk.postMessage(JSON.stringify(msg)); } catch(e){} };

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

  const entities = [];
  SPOTS.forEach((s) => {
    const ent = viewer.entities.add({
      id: s.id,
      name: s.name,
      position: Cesium.Cartesian3.fromDegrees(s.lng, s.lat, 30),
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

  const tele = document.getElementById('tele');
  SPOTS.forEach((s) => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.innerHTML = '<span class="dot" style="background:'+s.color+'"></span>' + s.name;
    chip.onclick = () => teleport(s);
    tele.appendChild(chip);
  });

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

  let moveX = 0, moveY = 0;
  const SPEED_MPS = 4.5;
  let lastT = performance.now();

  function step() {
    const now = performance.now();
    const dt = Math.min(0.1, (now - lastT) / 1000);
    lastT = now;
    if (Math.abs(moveX) > 0.02 || Math.abs(moveY) > 0.02) {
      const dist = SPEED_MPS * dt;
      const forward = -moveY * dist;
      const strafe = moveX * dist;
      const dLat = (forward * Math.cos(heading) + strafe * Math.sin(heading)) / 111320;
      const dLng = (forward * Math.sin(heading) - strafe * Math.cos(heading)) / (111320 * Math.cos(latitude * Math.PI / 180));
      latitude += dLat;
      longitude += dLng;
      applyCamera();
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

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

  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((click) => {
    const picked = viewer.scene.pick(click.position);
    if (picked && picked.id && picked.id._spot) {
      showPop(picked.id._spot);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  function showPop(s) {
    const pop = document.getElementById('pop');
    pop.innerHTML = '<small>' + s.category.toUpperCase() + '</small>' + s.name + '<br/><button id="popBtn">OPEN DETAILS</button>';
    pop.style.display = 'block';
    document.getElementById('popBtn').onclick = () => post({ type: 'open', id: s.id });
  }
  document.addEventListener('click', (e) => {
    const pop = document.getElementById('pop');
    if (pop.style.display === 'block' && !pop.contains(e.target)) pop.style.display = 'none';
  });

  post({ type: 'ready' });
})();
</script>
</body>
</html>
"""
    }
}

// MARK: - WKWebView wrapper

private struct CesiumWebView: UIViewRepresentable {
    let html: String
    var onOpenSpot: (String) -> Void

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        let userController = WKUserContentController()
        userController.add(context.coordinator, name: "walk")
        config.userContentController = userController

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.isOpaque = false
        webView.backgroundColor = .black
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.bounces = false
        context.coordinator.webView = webView
        webView.loadHTMLString(html, baseURL: URL(string: "https://cesium.com"))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        context.coordinator.onOpenSpot = onOpenSpot
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(onOpenSpot: onOpenSpot)
    }

    @MainActor
    final class Coordinator: NSObject, WKScriptMessageHandler {
        var onOpenSpot: (String) -> Void
        weak var webView: WKWebView?

        init(onOpenSpot: @escaping (String) -> Void) {
            self.onOpenSpot = onOpenSpot
        }

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "walk",
                  let body = message.body as? String,
                  let data = body.data(using: .utf8),
                  let msg = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return }
            if msg["type"] as? String == "open", let id = msg["id"] as? String {
                onOpenSpot(id)
            }
        }
    }
}

// MARK: - Helpers

private extension String {
    /// JSON-escaped string literal (for embedding the token into the HTML).
    var jsonEncoded: String {
        guard let data = try? JSONSerialization.data(withJSONObject: [self]),
              let array = String(data: data, encoding: .utf8) else { return "\"\"" }
        return String(array.dropFirst().dropLast())
    }
}
