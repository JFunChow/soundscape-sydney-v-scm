//
//  SoundSpotCardView.swift
//  SoundscapeSydney
//
//  Port of expo/components/sound-spot-card.tsx — asymmetric editorial card
//  with category tag, big index number, favorite heart and level row.
//

import SwiftUI

struct SoundSpotCardView: View {
    let spot: SoundSpot
    var index: Int = 0

    @Environment(\.favorites) private var favorites

    var body: some View {
        NavigationLink(value: spot.id) {
            cardBody
        }
        .buttonStyle(PressScaleStyle())
        .padding(.leading, index % 2 == 0 ? 0 : 18)
        .padding(.bottom, 18)
    }

    private var color: Color { spot.category.color }
    private var imageUrl: URL? { SpotCatalog.heroImageURL(for: spot) }
    private var avgLevel: Double { averageSoundLevel(spot) }

    private var cardBody: some View {
        VStack(spacing: 0) {
            ZStack(alignment: .bottom) {
                RemoteImage(url: imageUrl, placeholderColor: color)
                    .frame(height: 240)
                    .clipped()

                Theme.cardFade
                    .allowsHitTesting(false)

                VStack {
                    // top row: category tag + favorite
                    HStack {
                        CategoryTag(category: spot.category)
                        Spacer()
                        Button {
                            favorites.toggleFavorite(spot.id)
                        } label: {
                            Image(systemName: favorites.isFavorite(spot.id) ? "heart.fill" : "heart")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundStyle(favorites.isFavorite(spot.id) ? Theme.neon : Theme.white)
                                .frame(width: 32, height: 32)
                                .background(Color(hex: "#050812").opacity(0.55))
                                .overlay(Circle().strokeBorder(Color.white.opacity(0.12)))
                                .clipShape(Circle())
                        }
                    }
                    .padding(14)

                    Spacer()

                    // bottom row: big index number + title + arrow
                    HStack(alignment: .bottom, spacing: 10) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(spot.name)
                                .font(.system(size: 22, weight: .black))
                                .tracking(-0.5)
                                .foregroundStyle(Theme.white)
                                .lineLimit(2)
                                .multilineTextAlignment(.leading)
                            if !spot.address.isEmpty {
                                Text(spot.address.components(separatedBy: ",").first ?? "")
                                    .font(.system(size: 11, weight: .semibold))
                                    .tracking(1)
                                    .textCase(.uppercase)
                                    .foregroundStyle(Theme.mist)
                                    .lineLimit(1)
                            }
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)

                        Image(systemName: "arrow.up.right")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundStyle(color)
                            .frame(width: 32, height: 32)
                            .background(Color(hex: "#050812").opacity(0.5))
                            .overlay(Circle().strokeBorder(color, lineWidth: 1))
                            .clipShape(Circle())
                    }
                    .padding(.horizontal, 18)
                    .padding(.bottom, 16)

                    // oversized ghost index number
                    Text(String(format: "%02d", index + 1))
                        .font(.system(size: 64, weight: .black))
                        .tracking(-2)
                        .foregroundStyle(Color.white.opacity(0.12))
                        .frame(maxWidth: .infinity, alignment: .trailing)
                        .padding(.trailing, 18)
                        .padding(.bottom, -58)
                        .offset(y: -64)
                        .allowsHitTesting(false)
                        .accessibilityHidden(true)
                }
            }
            .frame(height: 240)
            .clipped()

            if avgLevel > 0 {
                HStack {
                    Text("SOUND LEVEL")
                        .font(.system(size: 10, weight: .heavy))
                        .tracking(2)
                        .foregroundStyle(Theme.mist)
                    Spacer()
                    Text(soundLevelDisplay(spot))
                        .font(.system(size: 13, weight: .heavy))
                        .foregroundStyle(color)
                }
                .padding(.horizontal, 18)
                .padding(.vertical, 12)
                .overlay(alignment: .top) {
                    Rectangle().fill(Color.white.opacity(0.06)).frame(height: 1)
                }
            }
        }
        .background(Color.white.opacity(0.03))
        .overlay(
            RoundedRectangle(cornerRadius: 22)
                .strokeBorder(Color.white.opacity(0.08), lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 22))
    }
}

/// Press feedback: subtle scale like the Expo Pressable pressed state.
struct PressScaleStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.99 : 1)
            .animation(.spring(duration: 0.2), value: configuration.isPressed)
    }
}
