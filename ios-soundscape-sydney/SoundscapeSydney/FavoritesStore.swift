//
//  FavoritesStore.swift
//  SoundscapeSydney
//
//  Port of expo/providers/favorites-provider.tsx — persisted with UserDefaults.
//

import SwiftUI
import UIKit

@Observable
@MainActor
final class FavoritesStore {
    private static let storageKey = "sound-map-favorites"

    private(set) var favoriteIds: [String] = []
    private(set) var isReady = false

    init() {
        if let stored = UserDefaults.standard.string(forKey: Self.storageKey) {
            if let data = stored.data(using: .utf8),
               let parsed = try? JSONDecoder().decode([String].self, from: data) {
                favoriteIds = parsed
            }
        }
        isReady = true
    }

    func isFavorite(_ spotId: String) -> Bool {
        favoriteIds.contains(spotId)
    }

    func toggleFavorite(_ spotId: String) {
        if let index = favoriteIds.firstIndex(of: spotId) {
            favoriteIds.remove(at: index)
        } else {
            favoriteIds.append(spotId)
        }
        if let data = try? JSONEncoder().encode(favoriteIds),
           let string = String(data: data, encoding: .utf8) {
            UserDefaults.standard.set(string, forKey: Self.storageKey)
        }
        Haptics.selection()
    }
}

private struct FavoritesKey: EnvironmentKey {
    static let defaultValue: FavoritesStore = FavoritesStore()
}

extension EnvironmentValues {
    var favorites: FavoritesStore {
        get { self[FavoritesKey.self] }
        set { self[FavoritesKey.self] = newValue }
    }
}
