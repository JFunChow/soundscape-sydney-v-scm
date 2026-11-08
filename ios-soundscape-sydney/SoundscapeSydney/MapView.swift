//
//  MapView.swift
//  SoundscapeSydney
//
//  Port of expo/app/(tabs)/map.tsx — dark neon map, category filter chips,
//  live location, nearby carousel, tappable markers that push the detail page.
//

import SwiftUI
import MapKit
import CoreLocation

// MARK: - Annotation

final class SpotAnnotation: NSObject, MKAnnotation {
    let spot: SoundSpot
    var coordinate: CLLocationCoordinate2D { spot.coordinate }

    init(spot: SoundSpot) {
        self.spot = spot
    }
}

// MARK: - Map wrapper

struct NeonMapView: UIViewRepresentable {
    var spots: [SoundSpot]
    var userCoordinate: CLLocationCoordinate2D?
    var onSpotTap: (SoundSpot) -> Void
    @Binding var mapProxy: MKMapView?

    func makeUIView(context: Context) -> MKMapView {
        let mapView = MKMapView()
        mapView.overrideUserInterfaceStyle = .dark
        mapView.pointOfInterestFilter = .excludingAll
        mapView.showsBuildings = false
        mapView.showsTraffic = false
        mapView.showsCompass = false
        mapView.showsScale = false
        mapView.showsUserLocation = true
        mapView.delegate = context.coordinator

        var config = MKStandardMapConfiguration()
        config.pointOfInterestFilter = .excludingAll
        config.showsTraffic = false
        mapView.preferredConfiguration = config
        mapView.preferredConfiguration.elevationStyle = .flat

        let region = MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: -33.8688, longitude: 151.2093),
            span: MKCoordinateSpan(latitudeDelta: 0.08, longitudeDelta: 0.08)
        )
        mapView.setRegion(region, animated: false)
        context.coordinator.parent = self

        return mapView
    }

    func updateUIView(_ mapView: MKMapView, context: Context) {
        context.coordinator.parent = self
        context.coordinator.syncAnnotations(in: mapView)
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(parent: self)
    }

    @MainActor
    final class Coordinator: NSObject, MKMapViewDelegate {
        var parent: NeonMapView

        init(parent: NeonMapView) {
            self.parent = parent
        }

        func syncAnnotations(in mapView: MKMapView) {
            let wanted = parent.spots
            let wantedIds = Set(wanted.map(\.id))
            let existing = mapView.annotations.compactMap { $0 as? SpotAnnotation }
            let existingIds = Set(existing.map(\.spot.id))

            if existingIds != wantedIds {
                mapView.removeAnnotations(existing.filter { !wantedIds.contains($0.spot.id) })
                let toAdd = wanted.filter { !existingIds.contains($0.id) }
                mapView.addAnnotations(toAdd.map(SpotAnnotation.init))
            }
        }

        func mapView(_ mapView: MKMapView, viewFor annotation: MKAnnotation) -> MKAnnotationView? {
            guard let spotAnnotation = annotation as? SpotAnnotation else { return nil }
            let identifier = "spot-marker"
            let view = mapView.dequeueReusableAnnotationView(withIdentifier: identifier, for: spotAnnotation)
            if let markerView = view as? MarkerAnnotationView {
                markerView.configure(with: spotAnnotation.spot)
            } else {
                let markerView = MarkerAnnotationView(annotation: spotAnnotation, reuseIdentifier: identifier)
                markerView.configure(with: spotAnnotation.spot)
                markerView.canShowCallout = false
                return markerView
            }
            view.canShowCallout = false
            return view
        }

        func mapView(_ mapView: MKMapView, didSelect view: MKAnnotationView) {
            guard let spotAnnotation = view.annotation as? SpotAnnotation else { return }
            mapView.deselectAnnotation(view.annotation, animated: false)
            parent.onSpotTap(spotAnnotation.spot)
        }
    }
}

/// Neon dot annotation view: glowing category-colored dot with a pulsing ring.
final class MarkerAnnotationView: MKAnnotationView {
    private let dotLayer = CALayer()
    private let ringLayer = CAShapeLayer()
    private var pulseAnimation: CABasicAnimation?

    override init(annotation: MKAnnotation?, reuseIdentifier: String?) {
        super.init(annotation: annotation, reuseIdentifier: reuseIdentifier)
        frame = CGRect(x: 0, y: 0, width: 44, height: 44)
        centerOffset = CGPoint(x: 0, y: -0)
        isUserInteractionEnabled = true
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    func configure(with spot: SoundSpot) {
        let color = UIColor(spot.category.color)

        layer.sublayers?.forEach { $0.removeFromSuperlayer() }

        ringLayer.frame = bounds
        ringLayer.path = UIBezierPath(
            ovalIn: CGRect(x: bounds.midX - 6, y: bounds.midY - 6, width: 12, height: 12)
        ).cgPath
        ringLayer.strokeColor = color.cgColor
        ringLayer.fillColor = UIColor.clear.cgColor
        ringLayer.lineWidth = 1.5
        layer.addSublayer(ringLayer)

        let dotSize: CGFloat = 12
        dotLayer.frame = CGRect(
            x: bounds.midX - dotSize / 2,
            y: bounds.midY - dotSize / 2,
            width: dotSize, height: dotSize
        )
        dotLayer.backgroundColor = color.cgColor
        dotLayer.cornerRadius = dotSize / 2
        dotLayer.shadowColor = color.cgColor
        dotLayer.shadowOpacity = 1
        dotLayer.shadowRadius = 8
        dotLayer.shadowOffset = .zero
        layer.addSublayer(dotLayer)

        let pulse = CABasicAnimation(keyPath: "transform.scale")
        pulse.fromValue = 0.8
        pulse.toValue = 2.2
        pulse.duration = 1.4
        pulse.repeatCount = .infinity
        pulse.autoreverses = false
        pulse.timingFunction = CAMediaTimingFunction(name: .easeOut)
        ringLayer.add(pulse, forKey: "pulse")

        let fade = CABasicAnimation(keyPath: "opacity")
        fade.fromValue = 0.6
        fade.toValue = 0
        fade.duration = 1.4
        fade.repeatCount = .infinity
        ringLayer.add(fade, forKey: "fade")
    }
}

// MARK: - Screen

struct MapPaneView: View {
    @State private var selectedCategory: SoundCategory?
    @State private var userCoordinate: CLLocationCoordinate2D?
    @State private var locationError: String?
    @State private var mapProxy: MKMapView?
    @State private var route: SpotRoute?

    private var filteredSpots: [SoundSpot] {
        guard let selectedCategory else { return SpotCatalog.spots }
        return SpotCatalog.spots.filter { $0.category == selectedCategory }
    }

    private var nearbySpots: [(spot: SoundSpot, distance: Double)] {
        guard let userCoordinate else { return [] }
        return SpotCatalog.spots
            .map { ($0, haversineKm(userCoordinate, $0.coordinate)) }
            .sorted { $0.1 < $1.1 }
            .prefix(3)
            .map { $0 }
    }

    var body: some View {
        ZStack {
            Theme.ink.ignoresSafeArea()

            NeonMapView(
                spots: filteredSpots,
                onSpotTap: { spot in
                    route = SpotRoute(id: spot.id)
                },
                mapProxy: $mapProxy
            )
            .ignoresSafeArea()

            // top + bottom vignettes
            LinearGradient(
                colors: [Color(hex: "#050812").opacity(0.92), .clear],
                startPoint: .top, endPoint: .bottom
            )
            .frame(height: 240)
            .frame(maxHeight: .infinity, alignment: .top)
            .allowsHitTesting(false)

            LinearGradient(
                colors: [.clear, Color(hex: "#050812").opacity(0.85)],
                startPoint: .top, endPoint: .bottom
            )
            .frame(height: 220)
            .frame(maxHeight: .infinity, alignment: .bottom)
            .allowsHitTesting(false)

            VStack(spacing: 0) {
                header
                Spacer()
                if nearbySpots.isEmpty == false {
                    nearbyCarousel
                        .padding(.bottom, 110)
                }
            }
        }
        .navigationDestination(item: $route) { route in
            SpotDetailView(spot: route.spot!)
        }
        .task { await requestLocation() }
    }

    // MARK: Header

    private var header: some View {
        VStack(spacing: 14) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("SOUNDSCAPE")
                        .font(.system(size: 18, weight: .black))
                        .tracking(4)
                        .foregroundStyle(Theme.cyan)
                    Rectangle()
                        .fill(Theme.cyan.opacity(0.7))
                        .frame(width: 38, height: 1.5)
                    Text(
                        userCoordinate.map {
                            String(format: "%.4f°  %.4f°", $0.latitude, $0.longitude)
                        } ?? "33.8688° S · 151.2093° E"
                    )
                    .font(.system(size: 10, weight: .semibold))
                    .tracking(1.5)
                    .foregroundStyle(Theme.mist)
                }
                Spacer()
                HStack(spacing: 8) {
                    mapButton("location.fill") { centerOnUser() }
                    mapButton("scope") { centerOnSydney() }
                }
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    filterChip("All", color: .white, isActive: selectedCategory == nil) {
                        selectedCategory = nil
                    }
                    ForEach(SoundCategory.allCases) { category in
                        filterChip(category.rawValue, color: category.color, isActive: selectedCategory == category) {
                            selectedCategory = category
                        }
                    }
                }
                .padding(.horizontal, 22)
            }
        }
        .padding(.horizontal, 22)
        .padding(.top, 10)
    }

    private func mapButton(_ systemImage: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: systemImage)
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(Theme.cyan)
                .frame(width: 38, height: 38)
                .background(Theme.cyan.opacity(0.08))
                .overlay(Circle().strokeBorder(Theme.cyan.opacity(0.3)))
                .clipShape(Circle())
        }
    }

    private func filterChip(_ label: String, color: Color, isActive: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 7) {
                if label != "All" {
                    Circle().fill(color).frame(width: 6, height: 6)
                }
                Text(label)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(isActive ? color : Theme.cloud)
            }
            .padding(.horizontal, 13)
            .padding(.vertical, 8)
            .background(isActive ? color.opacity(0.09) : Color(hex: "#0A0D1C").opacity(0.6))
            .overlay(Capsule().strokeBorder(isActive ? color : Color.white.opacity(0.12)))
            .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }

    // MARK: Nearby carousel

    private var nearbyCarousel: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("NEARBY SOUNDSCAPES")
                .font(.system(size: 10, weight: .black))
                .tracking(2)
                .foregroundStyle(Theme.mist)
                .padding(.horizontal, 22)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(nearbySpots, id: \.spot.id) { pair in
                        NavigationLink(value: pair.spot.id) {
                            HStack(spacing: 10) {
                                Circle()
                                    .fill(pair.spot.category.color)
                                    .frame(width: 8, height: 8)
                                    .shadow(color: pair.spot.category.color, radius: 6)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(pair.spot.name)
                                        .font(.system(size: 13, weight: .heavy))
                                        .foregroundStyle(Theme.white)
                                        .lineLimit(1)
                                    Text("\(formatDistance(km: pair.distance)) · \(pair.spot.category.rawValue)")
                                        .font(.system(size: 10, weight: .semibold))
                                        .tracking(0.8)
                                        .foregroundStyle(Theme.mist)
                                        .lineLimit(1)
                                }
                            }
                            .padding(.horizontal, 14)
                            .padding(.vertical, 10)
                            .frame(minWidth: 200, maxWidth: 260, alignment: .leading)
                            .background(Color(hex: "#050812").opacity(0.85))
                            .overlay(RoundedRectangle(cornerRadius: 18).strokeBorder(Color.white.opacity(0.12)))
                            .clipShape(RoundedRectangle(cornerRadius: 18))
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 18)
            }
        }
    }

    // MARK: Location

    @State private var locationModel = LocationModel()

    private func requestLocation() async {
        await locationModel.request { coordinate, error in
            if let coordinate { userCoordinate = coordinate }
            if let error { locationError = error }
        }
    }

    private func centerOnSydney() {
        mapProxy?.setRegion(
            MKCoordinateRegion(
                center: CLLocationCoordinate2D(latitude: -33.8688, longitude: 151.2093),
                span: MKCoordinateSpan(latitudeDelta: 0.08, longitudeDelta: 0.08)
            ),
            animated: true
        )
    }

    private func centerOnUser() {
        if let userCoordinate {
            mapProxy?.setRegion(
                MKCoordinateRegion(
                    center: userCoordinate,
                    span: MKCoordinateSpan(latitudeDelta: 0.04, longitudeDelta: 0.04)
                ),
                animated: true
            )
        } else {
            Task { await requestLocation() }
        }
    }
}

@MainActor
final class LocationModel: NSObject, CLLocationManagerDelegate {
    private let manager = CLLocationManager()
    private var continuation: CheckedContinuation<Void, Never>?
    private var completion: ((CLLocationCoordinate2D?, String?) -> Void)?

    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyHundredMeters
    }

    func request(_ completion: @escaping (CLLocationCoordinate2D?, String?) -> Void) {
        self.completion = completion
        switch manager.authorizationStatus {
        case .notDetermined:
            manager.requestWhenInUseAuthorization()
        case .denied, .restricted:
            completion(nil, "Location permission denied")
        default:
            manager.requestLocation()
        }
    }

    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        Task { @MainActor in
            guard manager.authorizationStatus == .authorizedWhenInUse
                    || manager.authorizationStatus == .authorizedAlways else { return }
            manager.requestLocation()
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        Task { @MainActor in
            completion?(locations.first?.coordinate, nil)
            completion = nil
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        Task { @MainActor in
            completion?(nil, "Location unavailable")
            completion = nil
        }
    }
}
