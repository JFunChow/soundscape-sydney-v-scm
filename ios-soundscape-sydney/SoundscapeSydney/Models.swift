//
//  Models.swift
//  SoundscapeSydney
//
//  Codable mirror of expo/data/sound-spots.ts and expo/data/enrichment.ts.
//  The JSON catalog is exported from those files by scripts/export-swift-data.ts
//  so both apps share one single source of truth.
//

import Foundation
import CoreLocation
import SwiftUI

enum SoundCategory: String, Codable, CaseIterable, Identifiable {
    case biophony = "Biophony"
    case anthrophony = "Anthrophony"
    case geophony = "Geophony"

    var id: String { rawValue }

    var colorHex: String {
        switch self {
        case .biophony: return "#2FFFE0"
        case .anthrophony: return "#FF2FB8"
        case .geophony: return "#7C4BFF"
        }
    }

    var color: Color { Color(hex: colorHex) }
}

struct HistoricalRecord: Codable, Identifiable {
    var imageUrl: String
    var period: String
    var description: String
    var id: String { imageUrl + period }
}

struct Coordinate: Codable {
    var latitude: Double
    var longitude: Double
}

struct SoundSpot: Codable, Identifiable {
    var id: String
    var name: String
    var imageUrl: String
    var category: SoundCategory
    var soundLevelMin: String
    var soundLevelMax: String
    var address: String
    var crowdsourcingAudioUrl: String
    var videoUrl: String
    var audioUrl: String
    var historicalTitle: String
    var history: String
    var history2: String
    var historicalRecords: [HistoricalRecord]
    var pictureLink: String
    var dateTime: String
    var coordinates: Coordinate

    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: coordinates.latitude, longitude: coordinates.longitude)
    }
}

struct LiveInfo: Codable {
    var hours: [String]?
    var tip: String?
    var website: String?
    var source: String?
}

struct TimelineEvent: Codable, Identifiable {
    var year: String
    var event: String
    var id: String { year + event }
}

struct AdditionalArchive: Codable, Identifiable {
    var imageUrl: String
    var period: String
    var description: String
    var source: String?
    var id: String { imageUrl + period }
}

struct SpotEnrichment: Codable {
    var indigenousName: String?
    var custodians: String
    var culturalSignificance: String
    var historyTimeline: [TimelineEvent]
    var funFact: String
    var soundInterpretation: String
    var backupImageUrl: String?
    var additionalArchive: [AdditionalArchive]?
}

struct Catalog: Codable {
    var categoryColors: [String: String]
    var spots: [SoundSpot]
    var liveInfo: [String: LiveInfo]
    var enrichment: [String: SpotEnrichment]
}

/// Static access to the bundled catalog plus the shared level helpers.
enum SpotCatalog {
    static let shared: Catalog = {
        guard let url = Bundle.main.url(forResource: "catalog", withExtension: "json"),
              let data = try? Data(contentsOf: url) else {
            assertionFailure("catalog.json missing from bundle")
            return Catalog(categoryColors: [:], spots: [], liveInfo: [:], enrichment: [:])
        }
        let decoder = JSONDecoder()
        do {
            return try decoder.decode(Catalog.self, from: data)
        } catch {
            fatalError("Failed to decode catalog.json: \(error)")
        }
    }()

    static var spots: [SoundSpot] { shared.spots }

    static func spot(id: String) -> SoundSpot? {
        spots.first { $0.id == id }
    }

    static func liveInfo(for spot: SoundSpot) -> LiveInfo? {
        shared.liveInfo[spot.id]
    }

    static func enrichment(for spot: SoundSpot) -> SpotEnrichment? {
        shared.enrichment[spot.id]
    }

    static func heroImageURL(for spot: SoundSpot) -> URL? {
        let urlString = spot.imageUrl.isEmpty
            ? shared.enrichment[spot.id]?.backupImageUrl ?? ""
            : spot.imageUrl
        return urlString.isEmpty ? nil : URL(string: urlString)
    }
}

// MARK: - Sound level helpers (ported from sound-spots.ts)

func parseSoundLevel(_ raw: String) -> Double {
    guard !raw.isEmpty else { return 0 }
    let digits = raw.filter { $0.isNumber || $0 == "." }
    return Double(digits) ?? 0
}

private func formatDb(_ value: Double) -> String {
    value.truncatingRemainder(dividingBy: 1) == 0
        ? String(Int(value))
        : String(format: "%.1f", value)
}

func soundLevelDisplay(_ spot: SoundSpot) -> String {
    let min = parseSoundLevel(spot.soundLevelMin)
    let max = parseSoundLevel(spot.soundLevelMax)
    if min > 0 && max > 0 { return "\(formatDb(min))–\(formatDb(max)) dBA" }
    if max > 0 { return "\(formatDb(max)) dBA" }
    if min > 0 { return "\(formatDb(min)) dBA" }
    return "N/A"
}

func averageSoundLevel(_ spot: SoundSpot) -> Double {
    let min = parseSoundLevel(spot.soundLevelMin)
    let max = parseSoundLevel(spot.soundLevelMax)
    if min > 0 && max > 0 { return ((min + max) / 2).rounded() }
    if max > 0 { return max }
    if min > 0 { return min }
    return 0
}

func soundLevelLabel(_ spot: SoundSpot) -> String {
    let avg = averageSoundLevel(spot)
    if avg == 0 { return "Unknown" }
    if avg < 50 { return "Quiet" }
    if avg < 65 { return "Moderate" }
    if avg < 75 { return "Lively" }
    return "Loud"
}

// MARK: - Geo helpers (ported from map.tsx)

func haversineKm(_ a: CLLocationCoordinate2D, _ b: CLLocationCoordinate2D) -> Double {
    let r = 6371.0
    let dLat = (b.latitude - a.latitude) * .pi / 180
    let dLon = (b.longitude - a.longitude) * .pi / 180
    let lat1 = a.latitude * .pi / 180
    let lat2 = b.latitude * .pi / 180
    let x = pow(sin(dLat / 2), 2) + pow(sin(dLon / 2), 2) * cos(lat1) * cos(lat2)
    return 2 * r * asin(sqrt(x))
}

func formatDistance(km: Double) -> String {
    if km < 1 { return "\(Int((km * 1000).rounded())) m" }
    return String(format: "%.1f km", km)
}

/// Extracts a YouTube video id from youtu.be / youtube.com URLs.
func youTubeID(from url: String) -> String? {
    guard !url.isEmpty else { return nil }
    if url.contains("youtu.be/") {
        return url.components(separatedBy: "youtu.be/").last?.components(separatedBy: "?").first
    }
    if let range = url.range(of: "v=") {
        return url[range.upperBound...].components(separatedBy: "&").first
    }
    if url.contains("/embed/") {
        return url.components(separatedBy: "/embed/").last?.components(separatedBy: "?").first
    }
    return nil
}
