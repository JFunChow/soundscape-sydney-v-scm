//
//  Theme.swift
//  SoundscapeSydney
//
//  Neon cyberpunk design tokens, ported 1:1 from the Expo app's
//  expo/constants/colors.ts.
//

import SwiftUI

enum Theme {
    static let ink = Color(hex: "#050812")
    static let night = Color(hex: "#0A0D1C")
    static let deep = Color(hex: "#0E1230")
    static let slate = Color(hex: "#161B3A")
    static let mist = Color(hex: "#8A8FB8")
    static let cloud = Color(hex: "#D7DBFF")
    static let paper = Color(hex: "#F4F7FB")
    static let white = Color.white
    static let cyan = Color(hex: "#2FFFE0")
    static let aqua = Color(hex: "#00E0FF")
    static let teal = Color(hex: "#21D4B5")
    static let magenta = Color(hex: "#FF2FB8")
    static let neon = Color(hex: "#FF4FE3")
    static let violet = Color(hex: "#7C4BFF")
    static let coral = Color(hex: "#FF8A65")
    static let gold = Color(hex: "#FFD166")
    static let rose = Color(hex: "#FF5D8F")

    /// rgba(255,255,255,0.10) hairlines and card borders
    static let border = Color.white.opacity(0.10)
    static let overlay = Color.black.opacity(0.72)

    // Gradients (from Gradients tokens)
    static var appBackground: LinearGradient {
        LinearGradient(
            colors: [Color(hex: "#050812"), Color(hex: "#0A0D1C"), Color(hex: "#120B28")],
            startPoint: .top, endPoint: .bottom
        )
    }
    static var deepNight: LinearGradient {
        LinearGradient(
            colors: [Color(hex: "#050812"), Color(hex: "#0E0B28"), Color(hex: "#1B0B2E")],
            startPoint: .top, endPoint: .bottom
        )
    }
    static var accent: LinearGradient {
        LinearGradient(
            colors: [cyan, aqua],
            startPoint: .topLeading, endPoint: .bottomTrailing
        )
    }
    /// Cyan -> aqua -> violet CTA gradient
    static var cta: LinearGradient {
        LinearGradient(
            colors: [cyan, aqua, violet],
            startPoint: .topLeading, endPoint: .bottomTrailing
        )
    }
    static var cardFade: LinearGradient {
        LinearGradient(
            colors: [.clear, Color(hex: "#050812").opacity(0.2), Color(hex: "#050812").opacity(0.95)],
            startPoint: .top, endPoint: .bottom
        )
    }
}

extension Color {
    init(hex: String) {
        var value: UInt64 = 0
        var sanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        if sanitized.hasPrefix("#") { sanitized.removeFirst() }
        Scanner(string: sanitized).scanHexInt64(&value)
        let r, g, b, a: Double
        if sanitized.count == 8 {
            r = Double((value >> 24) & 0xFF) / 255.0
            g = Double((value >> 16) & 0xFF) / 255.0
            b = Double((value >> 8) & 0xFF) / 255.0
            a = Double(value & 0xFF) / 255.0
        } else {
            r = Double((value >> 16) & 0xFF) / 255.0
            g = Double((value >> 8) & 0xFF) / 255.0
            b = Double(value & 0xFF) / 255.0
            a = 1.0
        }
        self.init(.sRGB, red: r, green: g, blue: b, opacity: a)
    }
}

/// The app's typographic voice: heavy, tight, poster-like.
enum TypeSpec {
    static func brand(_ size: CGFloat = 13) -> Font {
        .system(size: size, weight: .black)
    }
    static func display(_ size: CGFloat) -> Font {
        .system(size: size, weight: .black).width(.condensed)
    }
}

/// Light haptic used across the app for neon interactions.
enum Haptics {
    static func light() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }
    static func medium() {
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
    }
    static func selection() {
        UISelectionFeedbackGenerator().selectionChanged()
    }
    static func success() {
        UINotificationFeedbackGenerator().notificationOccurred(.success)
    }
}
