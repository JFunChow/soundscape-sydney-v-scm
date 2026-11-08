//
//  SpotDetailView.swift
//  SoundscapeSydney
//
//  Port of expo/app/spots/[id].tsx — cinematic parallax hero, numbered
//  sections 01–09: field recording, decibel reading, immersive view,
//  what you hear, Country, timeline, insight, archive notes, archival images.
//

import SwiftUI
import UIKit

struct SpotDetailView: View {
    let spot: SoundSpot

    @Environment(\.favorites) private var favorites
    @Environment(\.dismiss) private var dismiss
    @State private var scrollOffset: CGFloat = 0
    @State private var appeared = false

    var body: some View {
        let categoryColor = spot.category.color
        let avgLevel = averageSoundLevel(spot)
        let live = SpotCatalog.liveInfo(for: spot)
        let enrichment = SpotCatalog.enrichment(for: spot)
        let spotIndex = SpotCatalog.spots.firstIndex(where: { $0.id == spot.id }).map { $0 + 1 } ?? 1

        ZStack(alignment: .top) {
            Theme.ink.ignoresSafeArea()

            // sticky blurred title when scrolled
            Text(spot.name)
                .font(.system(size: 15, weight: .heavy))
                .foregroundStyle(Theme.white)
                .lineLimit(1)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(
                    LinearGradient(
                        colors: [Color(hex: "#050812").opacity(0.95), Color(hex: "#050812").opacity(0.7)],
                        startPoint: .top, endPoint: .bottom
                    )
                )
                .opacity(scrollOffset > 80 ? min(1, (scrollOffset - 80) / 120) : 0)
                .zIndex(10)

            ScrollView {
                VStack(spacing: 22) {
                    hero(spotIndex: spotIndex, categoryColor: categoryColor)
                    VStack(alignment: .leading, spacing: 22) {
                        metaStrip(categoryColor: categoryColor, avgLevel: avgLevel)

                        if !spot.address.isEmpty {
                            addressCard(categoryColor: categoryColor)
                        }

                        if let live, hasLiveInfo(live) {
                            liveInfoCard(live, categoryColor: categoryColor)
                        }

                        let audioUrl = !spot.crowdsourcingAudioUrl.isEmpty ? spot.crowdsourcingAudioUrl : spot.audioUrl
                        if !audioUrl.isEmpty {
                            VStack(alignment: .leading, spacing: 14) {
                                SectionHeader(number: "01", label: "FIELD RECORDING")
                                AudioPlayerView(audioUrl: audioUrl, title: spot.name)
                            }
                        }

                        if avgLevel > 0 {
                            VStack(alignment: .leading, spacing: 14) {
                                SectionHeader(number: "02", label: "DECIBEL READING — \(soundLevelLabel(spot).uppercased())")
                                decibelBadge(categoryColor: categoryColor)
                            }
                        }

                        if youTubeID(from: spot.videoUrl) != nil {
                            VStack(alignment: .leading, spacing: 14) {
                                SectionHeader(number: "03", label: "IMMERSIVE VIEW")
                                VideoEmbedView(videoUrl: spot.videoUrl)
                            }
                        }

                        if let interpretation = enrichment?.soundInterpretation, !interpretation.isEmpty {
                            VStack(alignment: .leading, spacing: 14) {
                                SectionHeader(number: "04", label: "WHAT YOU HEAR")
                                HStack(alignment: .top, spacing: 10) {
                                    Image(systemName: "speaker.wave.2.fill")
                                        .font(.system(size: 13))
                                        .foregroundStyle(categoryColor)
                                    Text(interpretation)
                                        .font(.system(size: 14))
                                        .leading()
                                        .foregroundStyle(Theme.cloud)
                                }
                                .padding(16)
                                .background(Color.white.opacity(0.03))
                                .overlay(RoundedRectangle(cornerRadius: 18).strokeBorder(categoryColor.opacity(0.33)))
                                .clipShape(RoundedRectangle(cornerRadius: 18))
                            }
                        }

                        if let enrichment {
                            countryCard(enrichment)
                        }

                        if let timeline = enrichment?.historyTimeline, !timeline.isEmpty {
                            VStack(alignment: .leading, spacing: 14) {
                                SectionHeader(number: "06", label: "TIMELINE")
                                timelineView(timeline, categoryColor: categoryColor)
                            }
                        }

                        if let funFact = enrichment?.funFact, !funFact.isEmpty {
                            VStack(alignment: .leading, spacing: 14) {
                                SectionHeader(number: "07", label: "INSIGHT")
                                HStack(alignment: .top, spacing: 12) {
                                    Image(systemName: "sparkles")
                                        .font(.system(size: 15))
                                        .foregroundStyle(Theme.gold)
                                    Text(funFact)
                                        .font(.system(size: 14, weight: .medium))
                                        .leading()
                                        .foregroundStyle(Theme.gold)
                                }
                                .padding(18)
                                .background(Theme.gold.opacity(0.08))
                                .overlay(RoundedRectangle(cornerRadius: 20).strokeBorder(Theme.gold.opacity(0.28)))
                                .clipShape(RoundedRectangle(cornerRadius: 20))
                            }
                        }

                        if !spot.history.isEmpty {
                            VStack(alignment: .leading, spacing: 14) {
                                SectionHeader(number: "08", label: "ARCHIVE NOTES")
                                Text(spot.history)
                                    .font(.system(size: 14.5))
                                    .leading()
                                    .foregroundStyle(Theme.cloud)
                            }
                        }

                        if !spot.history2.isEmpty {
                            Text(spot.history2)
                                .font(.system(size: 14.5))
                                .leading()
                                .foregroundStyle(Theme.cloud)
                        }

                        let records = spot.historicalRecords + (enrichment?.additionalArchive?.map {
                            HistoricalRecord(imageUrl: $0.imageUrl, period: $0.period, description: $0.description)
                        } ?? [])
                        if !records.isEmpty {
                            VStack(alignment: .leading, spacing: 14) {
                                SectionHeader(number: "09", label: "ARCHIVAL IMAGES")
                                archivalCarousel(records)
                            }
                        }

                        if !spot.address.isEmpty {
                            navigateCTA
                        }
                    }
                    .padding(.horizontal, 22)
                    .padding(.top, 20)
                    .padding(.bottom, 60)
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 40)
                }
                .background(
                    GeometryReader { geo in
                        Color.clear.preference(
                            key: ScrollOffsetKey.self,
                            value: -geo.frame(in: .named("spotScroll")).minY
                        )
                    }
                )
            }
            .ignoresSafeArea(edges: .top)
            .coordinateSpace(name: "spotScroll")
            .onPreferenceChange(ScrollOffsetKey.self) { scrollOffset = $0 }
        }
        .navigationBarBackButtonHidden(true)
        .onAppear {
            withAnimation(.spring(duration: 0.7, bounce: 0.1)) {
                appeared = true
            }
        }
    }

    // MARK: Hero

    private func hero(spotIndex: Int, categoryColor: Color) -> some View {
        GeometryReader { proxy in
            let stretch = scrollOffset < 0 ? -scrollOffset : 0 // pull-down stretch
            let drift = scrollOffset > 0 ? -scrollOffset * 0.4 : 0 // parallax drift

            ZStack(alignment: .bottom) {
                RemoteImage(url: SpotCatalog.heroImageURL(for: spot), placeholderColor: categoryColor)
                    .frame(width: proxy.size.width, height: 480 + stretch)
                    .scaleEffect(1.05)
                    .clipped()
                    .offset(y: drift)

                LinearGradient(
                    colors: [Color(hex: "#050812").opacity(0.1), Color(hex: "#050812").opacity(0.2), Color(hex: "#050812").opacity(0.98)],
                    startPoint: .top, endPoint: .bottom
                )

                // neon halo
                Circle()
                    .fill(categoryColor.opacity(0.25))
                    .frame(width: 260, height: 260)
                    .blur(radius: 80)
                    .offset(x: -20, y: 60)

                VStack(alignment: .leading, spacing: 10) {
                    CategoryTag(category: spot.category)
                    Text(String(format: "%02d / %02d", spotIndex, SpotCatalog.spots.count))
                        .font(.system(size: 11, weight: .bold))
                        .tracking(3)
                        .foregroundStyle(Theme.mist)
                    Text(spot.name)
                        .font(.system(size: 40, weight: .black))
                        .tracking(-1)
                        .foregroundStyle(Theme.white)
                    if !spot.historicalTitle.isEmpty {
                        Text("— \(spot.historicalTitle)")
                            .font(.system(size: 14, weight: .semibold).italic())
                            .foregroundStyle(Theme.gold)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 22)
                .padding(.bottom, 28)
            }
            .frame(height: 480)
        }
        .frame(height: 480)
        .overlay(alignment: .top) {
            heroControls
        }
    }

    private var heroControls: some View {
        HStack {
            circleButton("chevron.left") { dismiss() }
            Spacer()
            circleButton(favorites.isFavorite(spot.id) ? "heart.fill" : "heart") {
                favorites.toggleFavorite(spot.id)
            }
            circleButton("square.and.arrow.up") {
                shareSpot()
            }
        }
        .padding(.horizontal, 18)
        .padding(.top, 60)
    }

    private func circleButton(_ systemImage: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: systemImage)
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(
                    systemImage.contains("heart.fill") ? Theme.neon : Theme.white
                )
                .frame(width: 38, height: 38)
                .background(Color(hex: "#050812").opacity(0.55))
                .overlay(Circle().strokeBorder(Color.white.opacity(0.14)))
                .clipShape(Circle())
        }
        .buttonStyle(PressScaleStyle())
    }

    private func shareSpot() {
        let text = "\(spot.name) — Soundscape Sydney"
        var items: [Any] = [text]
        if let url = SpotCatalog.heroImageURL(for: spot) { items.append(url) }
        let activityVC = UIActivityViewController(activityItems: items, applicationActivities: nil)
        if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let root = scene.keyWindow?.rootViewController {
            var top = root
            while let presented = top.presentedViewController { top = presented }
            top.present(activityVC, animated: true)
        }
    }

    // MARK: Meta strip

    private func metaStrip(categoryColor: Color, avgLevel: Double) -> some View {
        HStack(alignment: .bottom) {
            VStack(alignment: .leading, spacing: 4) {
                Text("COORDINATES")
                    .font(.system(size: 10, weight: .bold))
                    .tracking(2)
                    .foregroundStyle(Theme.mist)
                Text(String(format: "%.4f° · %.4f°", spot.coordinates.latitude, spot.coordinates.longitude))
                    .font(.system(size: 14, weight: .heavy))
                    .foregroundStyle(Theme.white)
            }
            Spacer()
            if avgLevel > 0 {
                VStack(alignment: .trailing, spacing: 4) {
                    Text("SOUND")
                        .font(.system(size: 10, weight: .bold))
                        .tracking(2)
                        .foregroundStyle(Theme.mist)
                    Text(soundLevelDisplay(spot))
                        .font(.system(size: 14, weight: .heavy))
                        .foregroundStyle(categoryColor)
                }
            }
        }
        .overlay(alignment: .bottom) {
            Rectangle().fill(Color.white.opacity(0.08)).frame(height: 1)
        }
        .padding(.bottom, 14)
    }

    // MARK: Address

    private func addressCard(categoryColor: Color) -> some View {
        Button {
            openDirections()
        } label: {
            HStack(spacing: 12) {
                Image(systemName: "mappin.and.ellipse")
                    .font(.system(size: 13))
                    .foregroundStyle(categoryColor)
                    .frame(width: 34, height: 34)
                    .overlay(Circle().strokeBorder(categoryColor))
                    .clipShape(Circle())
                VStack(alignment: .leading, spacing: 2) {
                    Text("LOCATION")
                        .font(.system(size: 9, weight: .heavy))
                        .tracking(1.8)
                        .foregroundStyle(Theme.mist)
                    Text(spot.address)
                        .font(.system(size: 13))
                        .foregroundStyle(Theme.cloud)
                        .multilineTextAlignment(.leading)
                }
                Spacer()
                Image(systemName: "arrow.up.right.square")
                    .font(.system(size: 14))
                    .foregroundStyle(Theme.mist)
            }
            .padding(14)
            .background(Color.white.opacity(0.03))
            .overlay(RoundedRectangle(cornerRadius: 16).strokeBorder(Color.white.opacity(0.08)))
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
        .buttonStyle(PressScaleStyle())
    }

    // MARK: Live info

    private func hasLiveInfo(_ live: LiveInfo) -> Bool {
        !(live.hours?.isEmpty ?? true) || live.tip?.isEmpty == false || live.website?.isEmpty == false
    }

    private func liveInfoCard(_ live: LiveInfo, categoryColor: Color) -> some View {
        GlassCard(glowColor: categoryColor) {
            VStack(alignment: .leading, spacing: 14) {
                HStack(spacing: 8) {
                    NeonDot(color: categoryColor, size: 8)
                    Text("LIVE · NOW")
                        .font(.system(size: 10, weight: .black))
                        .tracking(2)
                        .foregroundStyle(Theme.white)
                }

                if let hours = live.hours, !hours.isEmpty {
                    VStack(alignment: .leading, spacing: 10) {
                        HStack(spacing: 7) {
                            Image(systemName: "clock")
                                .font(.system(size: 13))
                                .foregroundStyle(Theme.cyan)
                            Text("Opening Hours")
                                .font(.system(size: 13, weight: .heavy))
                                .foregroundStyle(Theme.white)
                        }
                        VStack(alignment: .leading, spacing: 7) {
                            ForEach(hours, id: \.self) { hour in
                                HStack(spacing: 10) {
                                    Capsule()
                                        .fill(categoryColor)
                                        .frame(width: 2, height: 14)
                                    Text(hour)
                                        .font(.system(size: 12.5))
                                        .foregroundStyle(Theme.cloud)
                                }
                            }
                        }
                    }
                }

                if let tip = live.tip, !tip.isEmpty {
                    HStack(alignment: .top, spacing: 9) {
                        Image(systemName: "lightbulb.fill")
                            .font(.system(size: 12))
                            .foregroundStyle(Theme.gold)
                        Text(tip)
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundStyle(Theme.gold)
                    }
                    .padding(12)
                    .background(Theme.gold.opacity(0.06))
                    .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(Theme.gold.opacity(0.18)))
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                }

                if let website = live.website, !website.isEmpty,
                   let url = URL(string: website) {
                    Button {
                        UIApplication.shared.open(url)
                    } label: {
                        HStack(spacing: 8) {
                            Image(systemName: "globe")
                                .font(.system(size: 13))
                                .foregroundStyle(Theme.cyan)
                            Text(website.replacingOccurrences(of: "https://", with: "").replacingOccurrences(of: "http://", with: ""))
                                .font(.system(size: 12, weight: .bold))
                                .foregroundStyle(Theme.cyan)
                                .lineLimit(1)
                            Spacer()
                            Image(systemName: "arrow.up.right")
                                .font(.system(size: 12))
                                .foregroundStyle(Theme.cyan)
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    // MARK: Decibel badge

    private func decibelBadge(categoryColor: Color) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("RANGE")
                    .font(.system(size: 10, weight: .heavy))
                    .tracking(2)
                    .foregroundStyle(Theme.mist)
                Spacer()
                Text(soundLevelDisplay(spot))
                    .font(.system(size: 20, weight: .black))
                    .foregroundStyle(categoryColor)
            }
            // Range bar
            GeometryReader { proxy in
                let minLevel = parseSoundLevel(spot.soundLevelMin)
                let maxLevel = parseSoundLevel(spot.soundLevelMax)
                let lower = max(0, min(1, (minLevel - 30) / 60))
                let upper = max(0, min(1, (max(minLevel, maxLevel) - 30) / 60))
                ZStack(alignment: .leading) {
                    Capsule().fill(Color.white.opacity(0.08))
                    Capsule()
                        .fill(Theme.accent)
                        .frame(width: max(6, proxy.size.width * (upper - lower)))
                        .shadow(color: categoryColor, radius: 6)
                        .offset(x: proxy.size.width * lower)
                }
            }
            .frame(height: 6)

            HStack {
                ForEach(["30", "50", "70", "90"], id: \.self) { tick in
                    Text(tick)
                        .font(.system(size: 9, weight: .bold))
                        .tracking(1)
                        .foregroundStyle(Theme.mist)
                    if tick != "90" { Spacer() }
                }
            }
        }
        .padding(18)
        .background(Color.white.opacity(0.03))
        .overlay(RoundedRectangle(cornerRadius: 18).strokeBorder(categoryColor.opacity(0.3)))
        .clipShape(RoundedRectangle(cornerRadius: 18))
    }

    // MARK: Country

    private func countryCard(_ enrichment: SpotEnrichment) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            SectionHeader(number: "05", label: "COUNTRY")

            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 8) {
                    Image(systemName: "person.2.fill")
                        .font(.system(size: 13))
                        .foregroundStyle(Theme.gold)
                    Text(enrichment.custodians)
                        .font(.system(size: 12, weight: .heavy))
                        .tracking(1)
                        .foregroundStyle(Theme.gold)
                }

                if let indigenousName = enrichment.indigenousName, !indigenousName.isEmpty {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("TRADITIONAL NAME")
                            .font(.system(size: 9, weight: .black))
                            .tracking(2)
                            .foregroundStyle(Theme.mist)
                        Text(indigenousName)
                            .font(.system(size: 18, weight: .black).italic())
                            .tracking(-0.5)
                            .foregroundStyle(Theme.white)
                    }
                    .padding(.vertical, 10)
                    .padding(.horizontal, 12)
                    .background(Color(hex: "#050812").opacity(0.4))
                    .overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(Theme.gold.opacity(0.15)))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                Text(enrichment.culturalSignificance)
                    .font(.system(size: 14.5))
                    .leading()
                    .foregroundStyle(Theme.cloud)

                Text("We acknowledge the Traditional Custodians of Country throughout Sydney and pay respect to Elders past, present and emerging.")
                    .font(.system(size: 11).italic())
                    .foregroundStyle(Theme.mist)
                    .overlay(alignment: .top) {
                        Rectangle().fill(Theme.gold.opacity(0.15)).frame(height: 1)
                    }
                    .padding(.top, 10)
            }
            .padding(18)
            .background(Theme.gold.opacity(0.05))
            .overlay(RoundedRectangle(cornerRadius: 20).strokeBorder(Theme.gold.opacity(0.22)))
            .clipShape(RoundedRectangle(cornerRadius: 20))
        }
    }

    // MARK: Timeline

    private func timelineView(_ timeline: [TimelineEvent], categoryColor: Color) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(Array(timeline.enumerated()), id: \.element.id) { index, event in
                HStack(alignment: .top, spacing: 14) {
                    VStack(spacing: 0) {
                        NeonDot(color: categoryColor, size: 10, pulse: false)
                            .padding(.top, 4)
                        if index < timeline.count - 1 {
                            Rectangle()
                                .fill(Color.white.opacity(0.12))
                                .frame(width: 1.5, height: 28)
                                .padding(.top, 4)
                        }
                    }
                    .frame(width: 14)

                    VStack(alignment: .leading, spacing: 4) {
                        Text(event.year)
                            .font(.system(size: 11, weight: .black))
                            .tracking(1.5)
                            .foregroundStyle(categoryColor)
                        Text(event.event)
                            .font(.system(size: 13.5))
                            .foregroundStyle(Theme.cloud)
                    }
                    .padding(.bottom, 18)
                }
            }
        }
    }

    // MARK: Archival images

    private func archivalCarousel(_ records: [HistoricalRecord]) -> some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 14) {
                ForEach(Array(records.enumerated()), id: \.element.id) { index, record in
                    ZStack(alignment: .bottomLeading) {
                        RemoteImage(url: URL(string: record.imageUrl), placeholderColor: Theme.slate)
                            .frame(width: UIScreen.main.bounds.width * 0.78, height: 260)
                            .clipped()
                        LinearGradient(
                            colors: [.clear, Color(hex: "#050812").opacity(0.95)],
                            startPoint: .top, endPoint: .bottom
                        )
                        VStack(alignment: .leading, spacing: 5) {
                            Text("A.\(String(format: "%02d", index + 1))")
                                .font(.system(size: 10, weight: .black))
                                .tracking(2)
                                .foregroundStyle(Theme.cyan)
                            Text(record.period)
                                .font(.system(size: 13, weight: .bold))
                                .foregroundStyle(Theme.white)
                                .lineLimit(3)
                        }
                        .padding(16)
                    }
                    .frame(width: UIScreen.main.bounds.width * 0.78, height: 260)
                    .background(Color.white.opacity(0.04))
                    .overlay(RoundedRectangle(cornerRadius: 20).strokeBorder(Color.white.opacity(0.1)))
                    .clipShape(RoundedRectangle(cornerRadius: 20))
                }
            }
            .padding(.horizontal, 22)
        }
        .padding(.horizontal, -22)
    }

    // MARK: CTA

    private var navigateCTA: some View {
        Button {
            openDirections()
        } label: {
            HStack(spacing: 10) {
                Image(systemName: "mappin.and.ellipse")
                    .font(.system(size: 15, weight: .semibold))
                Text("NAVIGATE HERE")
                    .font(.system(size: 13, weight: .black))
                    .tracking(2)
            }
            .foregroundStyle(Theme.ink)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(Theme.cta)
            .clipShape(Capsule())
        }
        .buttonStyle(PressScaleStyle())
    }

    private func openDirections() {
        let destination = "maps://app?daddr=\(spot.coordinates.latitude),\(spot.coordinates.longitude)"
        if let url = URL(string: destination) {
            UIApplication.shared.open(url)
        }
    }
}

extension Text {
    /// multi-line, leading-aligned body text
    func leading() -> some View {
        lineSpacing(4)
            .fixedSize(horizontal: false, vertical: true)
            .multilineTextAlignment(.leading)
    }
}

struct ScrollOffsetKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}
