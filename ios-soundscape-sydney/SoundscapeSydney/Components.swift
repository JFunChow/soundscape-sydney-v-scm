//
//  Components.swift
//  SoundscapeSydney
//
//  Shared neon building blocks: category tags, numbered section headers,
//  glass cards, ambient orbs, remote images.
//

import SwiftUI

// MARK: - Ambient background

/// Deep-night gradient with two slowly pulsing neon orbs (from the Expo app).
struct NeonBackdrop: View {
    var colors: [Color] = [Color(hex: "#050812"), Color(hex: "#0A0D1C"), Color(hex: "#160B28")]

    @State private var glow = false

    var body: some View {
        ZStack {
            LinearGradient(colors: colors, startPoint: .top, endPoint: .bottom)
            GeometryReader { proxy in
                Circle()
                    .fill(Color(hex: "#FF2FB8").opacity(0.18))
                    .frame(width: 340, height: 340)
                    .blur(radius: 10)
                    .offset(x: proxy.size.width + 40, y: -100)
                    .opacity(glow ? 0.9 : 0.3)
                Circle()
                    .fill(Color(hex: "#2FFFE0").opacity(0.14))
                    .frame(width: 340, height: 340)
                    .blur(radius: 10)
                    .offset(x: -140, y: 300)
                    .opacity(glow ? 0.9 : 0.3)
            }
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation(.easeInOut(duration: 2.4).repeatForever(autoreverses: true)) {
                glow = true
            }
        }
    }
}

// MARK: - Category tag pill

struct CategoryTag: View {
    let category: SoundCategory

    var body: some View {
        HStack(spacing: 6) {
            Circle()
                .fill(category.color)
                .frame(width: 6, height: 6)
                .shadow(color: category.color, radius: 6)
            Text(category.rawValue.uppercased())
                .font(.system(size: 10, weight: .black))
                .tracking(1.5)
                .foregroundStyle(category.color)
        }
        .padding(.horizontal, 11)
        .padding(.vertical, 6)
        .background(Color(hex: "#050812").opacity(0.4))
        .overlay(
            Capsule().strokeBorder(category.color, lineWidth: 1)
        )
        .clipShape(Capsule())
    }
}

// MARK: - Numbered section header (01 — FIELD RECORDING)

struct SectionHeader: View {
    let number: String
    let label: String

    var body: some View {
        HStack(spacing: 10) {
            Text(number)
                .font(.system(size: 11, weight: .black))
                .tracking(2)
                .foregroundStyle(Theme.mist)
            Text(label)
                .font(.system(size: 11, weight: .black))
                .tracking(2)
                .foregroundStyle(Theme.white)
                .lineLimit(1)
            Rectangle()
                .fill(Color.white.opacity(0.12))
                .frame(height: 1)
        }
    }
}

// MARK: - Glass card

struct GlassCard<Content: View>: View {
    var cornerRadius: CGFloat = 22
    var glowColor: Color?
    @ViewBuilder var content: () -> Content

    var body: some View {
        content()
            .padding(18)
            .background(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .fill(
                        LinearGradient(
                            colors: [Color.white.opacity(0.08), Color.white.opacity(0.02)],
                            startPoint: .top, endPoint: .bottom
                        )
                    )
            )
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .strokeBorder(Color.white.opacity(0.12), lineWidth: 1)
            )
            .background {
                if let glowColor {
                    Circle()
                        .fill(glowColor.opacity(0.35))
                        .frame(width: 140, height: 140)
                        .blur(radius: 50)
                        .offset(x: 60, y: -60)
                        .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
                }
            }
    }
}

// MARK: - Remote image with neon placeholder

struct RemoteImage: View {
    let url: URL?
    var placeholderColor: Color

    var body: some View {
        if let url {
            AsyncImage(url: url) { phase in
                if let image = phase.image {
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } else {
                    ZStack {
                        placeholderColor.opacity(0.13)
                        Image(systemName: "waveform")
                            .font(.system(size: 32))
                            .foregroundStyle(placeholderColor)
                    }
                }
            }
        } else {
            ZStack {
                placeholderColor.opacity(0.13)
                Image(systemName: "waveform")
                    .font(.system(size: 32))
                    .foregroundStyle(placeholderColor)
            }
        }
    }
}

// MARK: - Pulsing dot (used in live headers, timelines, markers)

struct NeonDot: View {
    var color: Color
    var size: CGFloat = 8
    var pulse: Bool = true

    @State private var animating = false

    var body: some View {
        ZStack {
            if pulse {
                Circle()
                    .stroke(color, lineWidth: 1.5)
                    .frame(width: size * 2.6, height: size * 2.6)
                    .scaleEffect(animating ? 2.0 : 0.8)
                    .opacity(animating ? 0 : 0.6)
            }
            Circle()
                .fill(color)
                .frame(width: size, height: size)
                .shadow(color: color, radius: 6)
        }
        .onAppear {
            guard pulse else { return }
            withAnimation(.easeOut(duration: 1.4).repeatForever(autoreverses: false)) {
                animating = true
            }
        }
    }
}
