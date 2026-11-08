//
//  ExploreView.swift
//  SoundscapeSydney
//
//  Port of expo/app/(tabs)/explore.tsx — editorial masthead, search,
//  featured transmission, layer filter chips, asymmetric index.
//

import SwiftUI

struct ExploreView: View {
    @State private var selectedCategory: SoundCategory?
    @State private var searchQuery = ""

    private var filteredSpots: [SoundSpot] {
        var spots = SpotCatalog.spots
        if let selectedCategory {
            spots = spots.filter { $0.category == selectedCategory }
        }
        let query = searchQuery.trimmingCharacters(in: .whitespacesAndNewlines)
        if !query.isEmpty {
            spots = spots.filter {
                $0.name.localizedCaseInsensitiveContains(query)
                    || $0.address.localizedCaseInsensitiveContains(query)
                    || $0.category.rawValue.localizedCaseInsensitiveContains(query)
            }
        }
        return spots
    }

    var body: some View {
        ZStack {
            NeonBackdrop()
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    masthead
                    searchBar
                    featured
                    layersHeader
                    layerChips
                    indexHeader
                    indexList
                }
                .padding(.horizontal, 22)
                .padding(.top, 8)
                .padding(.bottom, 140)
            }
        }
    }

    // MARK: Masthead

    private var masthead: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 10) {
                Text("SOUNDSCAPE")
                    .font(.system(size: 13, weight: .black))
                    .tracking(3)
                    .foregroundStyle(Theme.cyan)
                Rectangle()
                    .fill(Theme.cyan.opacity(0.25))
                    .frame(height: 1)
                Text("2026/V")
                    .font(.system(size: 10, weight: .bold))
                    .tracking(2)
                    .foregroundStyle(Theme.mist)
            }
            Text("33.8688° S · 151.2093° E")
                .font(.system(size: 10, weight: .semibold))
                .tracking(2)
                .foregroundStyle(Theme.mist)
                .padding(.top, 4)
                .padding(.bottom, 28)

            Text("Sydney\nthrough\n")
                .font(.system(size: 54, weight: .black))
                .tracking(-2)
                .foregroundStyle(Theme.white)
            + Text("sound.")
                .font(.system(size: 54, weight: .black).italic())
                .tracking(-2)
                .foregroundStyle(Theme.neon)

            HStack(spacing: 10) {
                metaItem("\(SpotCatalog.spots.count) SPOTS")
                metaDivider
                metaItem("3 LAYERS")
                metaDivider
                metaItem("LIVE ARCHIVE")
            }
            .padding(.top, 20)
        }
        .padding(.bottom, 22)
    }

    private func metaItem(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 10, weight: .heavy))
            .tracking(1.5)
            .foregroundStyle(Theme.cloud)
    }

    private var metaDivider: some View {
        Circle().fill(Theme.mist).frame(width: 3, height: 3)
    }

    // MARK: Search

    private var searchBar: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(Theme.mist)
            TextField("", text: $searchQuery, prompt: Text("Search places, sounds...").foregroundStyle(Theme.mist))
                .font(.system(size: 14))
                .foregroundStyle(Theme.white)
                .autocorrectionDisabled()
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .background(Color.white.opacity(0.04))
        .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(Color.white.opacity(0.08)))
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .padding(.bottom, 26)
    }

    // MARK: Featured

    private var featured: some View {
        Group {
            if let featured = SpotCatalog.spots.first {
                NavigationLink(value: featured.id) {
                    featuredBody(featured)
                }
                .buttonStyle(PressScaleStyle())
            }
        }
        .padding(.bottom, 32)
    }

    private func featuredBody(_ spot: SoundSpot) -> some View {
        ZStack(alignment: .topTrailing) {
            VStack(alignment: .leading, spacing: 0) {
                HStack {
                    Text("FEATURED TRANSMISSION")
                        .font(.system(size: 10, weight: .black))
                        .tracking(2)
                        .foregroundStyle(Theme.neon)
                    if averageSoundLevel(spot) > 0 {
                        HStack(spacing: 5) {
                            Image(systemName: "water.waves")
                                .font(.system(size: 10, weight: .bold))
                            Text("LIVE")
                                .font(.system(size: 9, weight: .black))
                                .tracking(1.5)
                        }
                        .foregroundStyle(Theme.cyan)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .overlay(Capsule().strokeBorder(Theme.cyan.opacity(0.4)))
                        .clipShape(Capsule())
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                Text(spot.name)
                    .font(.system(size: 32, weight: .black))
                    .tracking(-1)
                    .foregroundStyle(Theme.white)
                    .lineLimit(2)
                    .padding(.top, 14)

                Text(spot.address)
                    .font(.system(size: 12))
                    .foregroundStyle(Theme.cloud.opacity(0.75))
                    .lineLimit(2)
                    .padding(.top, 6)

                HStack(alignment: .bottom) {
                    Text("LISTEN NOW →")
                        .font(.system(size: 12, weight: .black))
                        .tracking(2)
                        .foregroundStyle(Theme.cyan)
                    Spacer()
                    Text("001")
                        .font(.system(size: 48, weight: .black))
                        .tracking(-2)
                        .foregroundStyle(Color.white.opacity(0.15))
                }
                .padding(.top, 20)
            }
            .padding(22)

            // decorative diagonal slash
            Rectangle()
                .fill(Theme.magenta.opacity(0.3))
                .frame(width: 200, height: 1)
                .rotationEffect(.degrees(-35))
                .offset(x: 40, y: 60)
        }
        .background(Color(hex: "#FF2FB8").opacity(0.06))
        .overlay(RoundedRectangle(cornerRadius: 20).strokeBorder(Theme.neon, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 20))
    }

    // MARK: Layers

    private var layersHeader: some View {
        HStack(spacing: 10) {
            Text("LAYERS")
                .font(.system(size: 12, weight: .black))
                .tracking(2)
                .foregroundStyle(Theme.white)
            Text("·").foregroundStyle(Theme.mist)
            Text("tap to filter")
                .font(.system(size: 11, weight: .semibold))
                .tracking(1)
                .foregroundStyle(Theme.mist)
        }
        .padding(.bottom, 12)
    }

    private var layerChips: some View {
        HStack(spacing: 8) {
            layerChip(
                label: "ALL", count: SpotCatalog.spots.count,
                color: .white, isActive: selectedCategory == nil
            ) {
                selectedCategory = nil
            }
            ForEach(SoundCategory.allCases) { category in
                layerChip(
                    label: category.rawValue.uppercased(),
                    count: SpotCatalog.spots.filter { $0.category == category }.count,
                    color: category.color,
                    isActive: selectedCategory == category
                ) {
                    selectedCategory = category
                }
            }
        }
        .padding(.bottom, 32)
    }

    private func layerChip(label: String, count: Int, color: Color, isActive: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Circle()
                    .fill(color)
                    .frame(width: 6, height: 6)
                    .shadow(color: color, radius: 5)
                Text("\(count)")
                    .font(.system(size: 12, weight: .black))
                    .foregroundStyle(isActive ? color : Theme.white)
                Text(label)
                    .font(.system(size: 10, weight: .heavy))
                    .tracking(1.5)
                    .foregroundStyle(isActive ? color : Theme.mist)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(isActive ? color.opacity(0.07) : Color.white.opacity(0.03))
            .overlay(Capsule().strokeBorder(isActive ? color : Color.white.opacity(0.1)))
            .clipShape(Capsule())
        }
        .buttonStyle(.plain)
        .sensoryFeedback(.selection, trigger: isActive)
    }

    // MARK: Index

    private var indexHeader: some View {
        HStack(spacing: 12) {
            Text(selectedCategory?.rawValue.uppercased() ?? "INDEX")
                .font(.system(size: 13, weight: .black))
                .tracking(2)
                .foregroundStyle(Theme.white)
            Rectangle()
                .fill(Color.white.opacity(0.12))
                .frame(height: 1)
            Text(String(format: "%02d", filteredSpots.count))
                .font(.system(size: 13, weight: .black))
                .foregroundStyle(Theme.cyan)
        }
        .padding(.bottom, 18)
    }

    private var indexList: some View {
        LazyVStack(alignment: .leading, spacing: 0) {
            if filteredSpots.isEmpty {
                VStack(spacing: 10) {
                    Image(systemName: "mappin.and.ellipse")
                        .font(.system(size: 28))
                        .foregroundStyle(Theme.mist)
                    Text("No spots found")
                        .font(.system(size: 18, weight: .heavy))
                        .foregroundStyle(Theme.white)
                    Text("Try a different layer or search term.")
                        .font(.system(size: 14))
                        .foregroundStyle(Theme.cloud)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 48)
            } else {
                ForEach(Array(filteredSpots.enumerated()), id: \.element.id) { index, spot in
                    SoundSpotCardView(spot: spot, index: index)
                }
            }
        }
    }
}
