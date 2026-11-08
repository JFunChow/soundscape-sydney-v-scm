//
//  ContentView.swift
//  SoundscapeSydney
//
//  Root shell: six panes inside NavigationStacks plus the floating
//  pill tab bar (horizontal labels only, neon focus ring).
//

import SwiftUI

enum Tab: String, CaseIterable, Hashable {
    case explore, map, walk, meter, add, saved

    var label: String {
        switch self {
        case .explore: return "Explore"
        case .map: return "Map"
        case .walk: return "Walk"
        case .meter: return "Meter"
        case .add: return "Add"
        case .saved: return "Saved"
        }
    }

    var icon: String {
        switch self {
        case .explore: return "safari"
        case .map: return "map.fill"
        case .walk: return "orbit"
        case .meter: return "waveform.path.ecg"
        case .add: return "plus"
        case .saved: return "bookmark"
        }
    }
}

struct SpotRoute: Identifiable, Hashable {
    let id: String
    var spot: SoundSpot? { SpotCatalog.spot(id: id) }
}

@MainActor
@Observable
final class TabRouter {
    var selection: Tab = .explore
}

struct ContentView: View {
    @State private var router = TabRouter()
    @State private var favorites = FavoritesStore()

    var body: some View {
        ZStack(alignment: .bottom) {
            pane(.explore) { ExploreView() }
            pane(.map) { MapPaneView() }
            pane(.walk) { WalkPaneView() }
            pane(.meter) { MeterPaneView() }
            pane(.add) { AddPaneView() }
            pane(.saved) { SavedPaneView() }

            PillTabBar(selection: router.selection) { tab in
                withAnimation(.spring(duration: 0.35, bounce: 0.2)) {
                    router.selection = tab
                }
                Haptics.selection()
            }
        }
        .environment(router)
        .preferredColorScheme(.dark)
    }

    @ViewBuilder
    private func pane<Content: View>(_ tab: Tab, @ViewBuilder content: () -> Content) -> some View {
        let isActive = router.selection == tab
        NavigationStack {
            content()
                .navigationDestination(for: String.self) { id in
                    if let spot = SpotCatalog.spot(id: id) {
                        SpotDetailView(spot: spot)
                    }
                }
        }
        .opacity(isActive ? 1 : 0)
        .allowsHitTesting(isActive)
        // keep scroll/state alive across tab switches
        .zIndex(isActive ? 1 : 0)
    }
}

// MARK: - Pill tab bar

private struct PillTabBar: View {
    let selection: Tab
    let onSelect: (Tab) -> Void

    var body: some View {
        HStack(spacing: 2) {
            ForEach(Tab.allCases, id: \.self) { tab in
                tabButton(tab)
            }
        }
        .padding(.vertical, 10)
        .padding(.horizontal, 6)
        .background(Color(hex: "#050812").opacity(0.94))
        .overlay(Capsule().strokeBorder(Color.white.opacity(0.1)))
        .clipShape(Capsule())
        .padding(.horizontal, 18)
        .padding(.bottom, 18)
        .shadow(color: .black.opacity(0.5), radius: 20, y: 8)
    }

    private func tabButton(_ tab: Tab) -> some View {
        let isActive = selection == tab
        return Button {
            onSelect(tab)
        } label: {
            HStack(spacing: 6) {
                Image(systemName: tab.icon)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(isActive ? Theme.white : Theme.cloud.opacity(0.55))
                if isActive {
                    Text(tab.label)
                        .font(.system(size: 11, weight: .heavy))
                        .foregroundStyle(Theme.white)
                        .lineLimit(1)
                        .fixedSize()
                }
            }
            .padding(.horizontal, isActive ? 12 : 10)
            .frame(minWidth: 40, minHeight: 40)
            .background(isActive ? Theme.cyan.opacity(0.12) : .clear)
            .overlay(
                Capsule().strokeBorder(isActive ? Theme.cyan.opacity(0.4) : .clear)
            )
            .clipShape(Capsule())
            .contentShape(Capsule())
        }
        .buttonStyle(.plain)
        .animation(.spring(duration: 0.3, bounce: 0.15), value: selection)
    }
}

#Preview {
    ContentView()
}
