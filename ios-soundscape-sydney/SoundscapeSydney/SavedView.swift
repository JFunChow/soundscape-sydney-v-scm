//
//  SavedView.swift
//  SoundscapeSydney
//
//  Port of expo/app/(tabs)/saved.tsx — the user's listening collection.
//

import SwiftUI

struct SavedPaneView: View {
    @Environment(\.favorites) private var favorites
    @Environment(TabRouter.self) private var router

    private var favoriteSpots: [SoundSpot] {
        SpotCatalog.spots.filter { favorites.favoriteIds.contains($0.id) }
    }

    var body: some View {
        ZStack {
            Theme.appBackground
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    Text("Saved places")
                        .font(.system(size: 13, weight: .heavy))
                        .tracking(1.1)
                        .textCase(.uppercase)
                        .foregroundStyle(Theme.cyan)
                        .padding(.bottom, 8)
                    Text("Your listening collection")
                        .font(.system(size: 30, weight: .black))
                        .foregroundStyle(Theme.white)
                        .padding(.bottom, 8)
                    Text("Build custom walking routes and playlists from your saved spots.")
                        .font(.system(size: 14))
                        .foregroundStyle(Theme.cloud)
                        .padding(.bottom, 20)

                    banner
                        .padding(.bottom, 22)

                    if favorites.isReady && favoriteSpots.isEmpty {
                        emptyState
                    } else {
                        ForEach(Array(favoriteSpots.enumerated()), id: \.element.id) { index, spot in
                            SoundSpotCardView(spot: spot, index: index)
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 8)
                .padding(.bottom, 130)
            }
        }
    }

    private var banner: some View {
        HStack(spacing: 14) {
            Image(systemName: "bookmark.fill")
                .font(.system(size: 17, weight: .semibold))
                .foregroundStyle(Theme.ink)
                .frame(width: 44, height: 44)
                .background(Theme.gold)
                .clipShape(Circle())
            VStack(alignment: .leading, spacing: 4) {
                Text("\(favoriteSpots.count) spots saved")
                    .font(.system(size: 16, weight: .heavy))
                    .foregroundStyle(Theme.white)
                Text(
                    favoriteSpots.isEmpty
                        ? "Tap the heart on any sound spot to save it here."
                        : "You have \(favoriteSpots.count) sound locations saved."
                )
                .font(.system(size: 13))
                .foregroundStyle(Theme.cloud)
            }
            Spacer()
        }
        .padding(18)
        .background(Color.white.opacity(0.06))
        .overlay(RoundedRectangle(cornerRadius: 22).strokeBorder(Theme.border))
        .clipShape(RoundedRectangle(cornerRadius: 22))
    }

    private var emptyState: some View {
        VStack(spacing: 0) {
            Image(systemName: "heart.fill")
                .font(.system(size: 24))
                .foregroundStyle(Theme.rose)
                .frame(width: 72, height: 72)
                .background(Theme.rose.opacity(0.12))
                .clipShape(Circle())
                .padding(.bottom, 16)
            Text("Nothing saved yet")
                .font(.system(size: 20, weight: .heavy))
                .foregroundStyle(Theme.white)
                .padding(.bottom, 8)
            Text("Explore the sound map and tap the heart icon on any spot to add it to your collection.")
                .font(.system(size: 14))
                .foregroundStyle(Theme.cloud)
                .multilineTextAlignment(.center)
                .padding(.bottom, 18)
            Button {
                router.selection = .explore
            } label: {
                Text("Explore sounds")
                    .font(.system(size: 14, weight: .heavy))
                    .foregroundStyle(Theme.ink)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 13)
                    .background(Theme.white)
                    .clipShape(Capsule())
            }
            .buttonStyle(PressScaleStyle())
        }
        .padding(.vertical, 42)
        .padding(.horizontal, 24)
        .background(Color.white.opacity(0.04))
        .overlay(RoundedRectangle(cornerRadius: 24).strokeBorder(Theme.border))
        .clipShape(RoundedRectangle(cornerRadius: 24))
    }
}
