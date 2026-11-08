//
//  MeterView.swift
//  SoundscapeSydney
//
//  Port of expo/app/(tabs)/meter.tsx — native decibel meter using
//  AVAudioEngine input tap with exponential smoothing (alpha 0.25),
//  60-bar history, qualitative categories and disclaimer.
//

import SwiftUI
import AVFoundation
import Accelerate

// MARK: - Level monitor

@MainActor
@Observable
final class DecibelMonitor {
    var isListening = false
    var rawDb: Double = 0
    var smoothedDb: Double = 0
    var peak: Double = 0
    var history: [Double] = []
    var permissionDenied = false

    static let historyLength = 60
    private static let smoothingAlpha = 0.25

    private let engine = AVAudioEngine()
    private var smoothed: Double = 0

    func toggle() {
        if isListening { stop() } else { start() }
    }

    func start() {
        let session = AVAudioSession.sharedInstance()
        AVAudioApplication.requestRecordPermission { [weak self] granted in
            Task { @MainActor in
                guard let self else { return }
                guard granted else {
                    self.permissionDenied = true
                    return
                }
                self.permissionDenied = false
                self.beginRecording(session: session)
            }
        }
    }

    private func beginRecording(session: AVAudioSession) {
        do {
            try session.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker])
            try session.setActive(true)
        } catch {
            permissionDenied = true
            return
        }

        let inputNode = engine.inputNode
        let format = inputNode.outputFormat(forBus: 0)

        inputNode.removeTap(onBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { [weak self] buffer, _ in
            guard let self, let channelData = buffer.floatChannelData else { return }
            let frameCount = Int(buffer.frameLength)
            guard frameCount > 0 else { return }

            var rms: Float = 0
            vDSP_rmsqv(channelData[0], 1, &rms, vDSP_Length(frameCount))
            let dbfs = rms > 0 ? 20 * log10(rms) : -160

            Task { @MainActor in
                self.ingest(dbfs: Double(dbfs))
            }
        }

        do {
            engine.prepare()
            try engine.start()
            isListening = true
            Haptics.medium()
        } catch {
            permissionDenied = true
        }
    }

    /// Metering is dBFS (negative). Approximate SPL: map -60..0 dBFS -> 30..100 dBA.
    private func ingest(dbfs: Double) {
        let clamped = max(-60, min(0, dbfs))
        let approxSpl = 30 + ((clamped + 60) / 60) * 70

        let alpha = Self.smoothingAlpha
        smoothed = smoothed == 0 ? approxSpl : smoothed * (1 - alpha) + approxSpl * alpha

        rawDb = approxSpl
        smoothedDb = smoothed
        if approxSpl > peak { peak = approxSpl }
        history.append(smoothed)
        if history.count > Self.historyLength {
            history.removeFirst(history.count - Self.historyLength)
        }
    }

    func stop() {
        engine.inputNode.removeTap(onBus: 0)
        engine.stop()
        isListening = false
    }
}

// MARK: - Categories (ported from meter.tsx)

struct LevelCategory: Identifiable {
    let threshold: Double
    let label: String
    let color: Color
    let description: String
    var id: String { label }
}

let meterCategories: [LevelCategory] = [
    LevelCategory(threshold: 40, label: "WHISPER", color: Theme.cyan, description: "Quieter than a library. A held breath before sound begins."),
    LevelCategory(threshold: 55, label: "QUIET", color: Theme.teal, description: "Rustling leaves, distant conversation. A gentle backdrop."),
    LevelCategory(threshold: 70, label: "MODERATE", color: Theme.gold, description: "Normal conversation, steady traffic. The everyday pulse of a city."),
    LevelCategory(threshold: 85, label: "LIVELY", color: Theme.coral, description: "Busy cafe, light rail passing. Expressive and kinetic."),
    LevelCategory(threshold: 999, label: "LOUD", color: Theme.neon, description: "Heavy traffic, crowds. Prolonged exposure may affect hearing."),
]

func levelCategory(for db: Double) -> LevelCategory {
    meterCategories.first { db < $0.threshold } ?? meterCategories[meterCategories.count - 1]
}

// MARK: - Screen

struct MeterPaneView: View {
    @State private var monitor = DecibelMonitor()

    private var category: LevelCategory { levelCategory(for: monitor.smoothedDb) }
    private var average: Double {
        monitor.history.isEmpty ? 0 : monitor.history.reduce(0, +) / Double(monitor.history.count)
    }

    var body: some View {
        ZStack {
            NeonBackdrop()
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    brandHeader

                    Text("LIVE ENVIRONMENTAL SOUND")
                        .font(.system(size: 11, weight: .bold))
                        .tracking(2)
                        .foregroundStyle(Theme.mist)
                        .padding(.bottom, 8)
                    Text("Listen to\nthe room.")
                        .font(.system(size: 42, weight: .black))
                        .tracking(-1.5)
                        .foregroundStyle(Theme.white)
                        .padding(.bottom, 28)

                    meterDial
                        .frame(maxWidth: .infinity)
                        .padding(.bottom, 20)

                    categoryPill
                        .frame(maxWidth: .infinity)
                        .padding(.bottom, 12)

                    Text(category.description)
                        .font(.system(size: 13))
                        .foregroundStyle(Theme.cloud)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: .infinity)
                        .padding(.horizontal, 10)
                        .padding(.bottom, 24)

                    historyCard
                        .padding(.bottom, 18)

                    legend
                        .padding(.bottom, 18)
                    disclaimer
                    if monitor.permissionDenied {
                        warningBox
                    }
                    toggleButton
                        .padding(.top, 6)
                }
                .padding(.horizontal, 22)
                .padding(.top, 12)
                .padding(.bottom, 140)
            }
        }
        .onDisappear { monitor.stop() }
    }

    private var brandHeader: some View {
        HStack(spacing: 10) {
            Text("DECIBEL")
                .font(.system(size: 13, weight: .black))
                .tracking(3)
                .foregroundStyle(Theme.cyan)
            Rectangle()
                .fill(Theme.cyan.opacity(0.25))
                .frame(height: 1)
            Text("BUILT-IN · SYDNEY")
                .font(.system(size: 10, weight: .bold))
                .tracking(2)
                .foregroundStyle(Theme.mist)
        }
        .padding(.bottom, 22)
    }

    // MARK: Dial

    private var meterDial: some View {
        ZStack {
            Circle()
                .stroke(category.color, lineWidth: 1.5)
                .frame(width: 240, height: 240)
                .scaleEffect(monitor.isListening ? 1.15 : 1)
                .opacity(monitor.isListening ? 0.25 : 0.2)
                .animation(.easeInOut(duration: 2.2).repeatForever(autoreverses: true), value: monitor.isListening)

            Circle()
                .fill(category.color.opacity(0.08))
                .frame(width: 200, height: 200)
                .overlay(Circle().strokeBorder(category.color, lineWidth: 2))
                .shadow(color: category.color, radius: 32)
                .scaleEffect(levelScale)

            VStack(spacing: 4) {
                Text(monitor.isListening ? "\(Int(monitor.smoothedDb.rounded()))" : "—")
                    .font(.system(size: 78, weight: .black))
                    .tracking(-3)
                    .foregroundStyle(Theme.white)
                    .contentTransition(.numericText())
                Text("dBA (approx)")
                    .font(.system(size: 11, weight: .bold))
                    .tracking(2)
                    .foregroundStyle(Theme.mist)
            }
        }
        .frame(height: 280)
        .animation(.spring(duration: 0.35), value: monitor.smoothedDb)
    }

    private var levelScale: CGFloat {
        guard monitor.isListening else { return 0.85 }
        let t = max(0, min(1, (monitor.smoothedDb - 30) / 60))
        return 0.85 + t * 0.3
    }

    private var categoryPill: some View {
        HStack(spacing: 8) {
            Circle()
                .fill(category.color)
                .frame(width: 6, height: 6)
                .shadow(color: category.color, radius: 6)
            Text(category.label)
                .font(.system(size: 11, weight: .black))
                .tracking(2)
                .foregroundStyle(category.color)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 8)
        .background(category.color.opacity(0.09))
        .overlay(Capsule().strokeBorder(category.color))
        .clipShape(Capsule())
    }

    // MARK: History

    private var historyCard: some View {
        VStack(spacing: 0) {
            HStack {
                Text("LAST 60 READINGS")
                    .font(.system(size: 10, weight: .black))
                    .tracking(2)
                    .foregroundStyle(Theme.white)
                Spacer()
                Text("AVG \(monitor.isListening && average > 0 ? "\(Int(average.rounded())) dBA" : "—")  ·  PEAK \(monitor.peak > 0 ? "\(Int(monitor.peak.rounded()))" : "—")")
                    .font(.system(size: 10, weight: .bold))
                    .tracking(1.5)
                    .foregroundStyle(Theme.mist)
            }
            .padding(.bottom, 12)

            HStack(alignment: .bottom, spacing: 2) {
                ForEach(0..<DecibelMonitor.historyLength, id: \.self) { i in
                    let value = i < monitor.history.count ? monitor.history[i] : 0
                    let height: CGFloat = value > 0 ? max(3, min(1, (value - 30) / 60) * 62) : 3
                    RoundedRectangle(cornerRadius: 1.5)
                        .fill(value > 0 ? levelCategory(for: value).color : Color.white.opacity(0.08))
                        .frame(height: height)
                }
            }
            .frame(height: 70, alignment: .bottom)
            .animation(.linear(duration: 0.12), value: monitor.history.count)

            HStack {
                Text("30")
                Spacer()
                Text("60")
                Spacer()
                Text("90 dBA")
            }
            .font(.system(size: 9, weight: .bold))
            .tracking(1)
            .foregroundStyle(Theme.mist)
            .padding(.top, 8)
        }
        .padding(18)
        .background(Color.white.opacity(0.04))
        .overlay(RoundedRectangle(cornerRadius: 22).strokeBorder(Color.white.opacity(0.1)))
        .clipShape(RoundedRectangle(cornerRadius: 22))
    }

    private var legend: some View {
        HStack(spacing: 10) {
            ForEach(meterCategories) { category in
                HStack(spacing: 5) {
                    Circle().fill(category.color).frame(width: 6, height: 6)
                    Text(category.label)
                        .font(.system(size: 9, weight: .heavy))
                        .tracking(1.5)
                        .foregroundStyle(Theme.mist)
                }
            }
        }
        .frame(maxWidth: .infinity)
    }

    private var disclaimer: some View {
        HStack(alignment: .top, spacing: 9) {
            Image(systemName: "info.circle")
                .font(.system(size: 13))
                .foregroundStyle(Theme.mist)
            Text("Readings are approximate. Smartphone microphones are not calibrated for scientific SPL measurement — values are useful for relative comparisons between environments.")
                .font(.system(size: 11))
                .foregroundStyle(Theme.mist)
        }
        .padding(12)
        .background(Color.white.opacity(0.03))
        .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(Color.white.opacity(0.08)))
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .padding(.bottom, 14)
    }

    private var warningBox: some View {
        HStack(alignment: .top, spacing: 9) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 14))
                .foregroundStyle(Theme.gold)
            Text("Microphone permission denied. Enable it in Settings to start listening.")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(Theme.gold)
        }
        .padding(12)
        .background(Theme.gold.opacity(0.08))
        .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(Theme.gold.opacity(0.25)))
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .padding(.bottom, 14)
    }

    private var toggleButton: some View {
        Button {
            monitor.toggle()
        } label: {
            HStack(spacing: 10) {
                Image(systemName: monitor.isListening ? "mic.slash.fill" : "mic.fill")
                    .font(.system(size: 16, weight: .semibold))
                Text(monitor.isListening ? "STOP LISTENING" : "START LISTENING")
                    .font(.system(size: 12, weight: .black))
                    .tracking(2)
            }
            .foregroundStyle(monitor.isListening ? Theme.neon : Theme.cyan)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(Color(hex: "#050812").opacity(0.6))
            .overlay(Capsule().strokeBorder(monitor.isListening ? Theme.neon : Theme.cyan))
            .clipShape(Capsule())
        }
        .buttonStyle(PressScaleStyle())
    }
}
