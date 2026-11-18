//
//  MediaViews.swift
//  SoundscapeSydney
//
//  Ports of audio-player.tsx (cached AVAudioPlayer with scrubber) and
//  video-embed.tsx (YouTube iframe in a WKWebView).
//

import SwiftUI
import AVFoundation
import WebKit

// MARK: - Audio player

struct AudioPlayerView: View {
    let audioUrl: String
    var title: String

    @State private var player: AVAudioPlayer?
    @State private var isPlaying = false
    @State private var progress: Double = 0
    @State private var isLoading = false
    @State private var timer: Timer?
    @State private var errorMessage: String?

    var body: some View {
        GlassCard {
            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 12) {
                    Button {
                        togglePlayback()
                    } label: {
                        ZStack {
                            Circle()
                                .fill(Theme.cyan.opacity(0.12))
                                .overlay(Circle().strokeBorder(Theme.cyan.opacity(0.4)))
                            if isLoading {
                                ProgressView()
                                    .tint(Theme.cyan)
                            } else {
                                Image(systemName: isPlaying ? "pause.fill" : "play.fill")
                                    .font(.system(size: 16, weight: .bold))
                                    .foregroundStyle(Theme.cyan)
                            }
                        }
                        .frame(width: 44, height: 44)
                    }
                    .buttonStyle(PressScaleStyle())

                    VStack(alignment: .leading, spacing: 4) {
                        Text("FIELD RECORDING")
                            .font(.system(size: 9, weight: .black))
                            .tracking(2)
                            .foregroundStyle(Theme.mist)
                        Text(title)
                            .font(.system(size: 14, weight: .heavy))
                            .foregroundStyle(Theme.white)
                            .lineLimit(1)
                    }
                    Spacer()
                }

                if let errorMessage {
                    Text(errorMessage)
                        .font(.system(size: 12))
                        .foregroundStyle(Theme.rose)
                }

                GeometryReader { proxy in
                    ZStack(alignment: .leading) {
                        Capsule()
                            .fill(Color.white.opacity(0.1))
                            .frame(height: 4)
                        Capsule()
                            .fill(Theme.accent)
                            .frame(width: max(4, proxy.size.width * progress), height: 4)
                            .shadow(color: Theme.cyan, radius: 6)
                    }
                }
                .frame(height: 4)
            }
        }
        .onDisappear {
            timer?.invalidate()
            player?.stop()
        }
    }

    private func togglePlayback() {
        if isPlaying {
            player?.pause()
            isPlaying = false
            timer?.invalidate()
            return
        }
        if let player {
            player.play()
            isPlaying = true
            startProgressTimer()
            return
        }
        guard let url = URL(string: audioUrl.atsSafe()) else {
            isLoading = false
            return
        }
        isLoading = true
        errorMessage = nil
        Task {
            let localURL = await cachedAudio(from: url)
            guard localURL.isFileURL else {
                // Download failed — never hand AVAudioPlayer a remote URL:
                // AudioFileOpenURL raises an uncatchable ObjC exception.
                isLoading = false
                errorMessage = "Recording unavailable — the source link is offline."
                return
            }
            do {
                try AVAudioSession.sharedInstance().setCategory(.playback)
                try AVAudioSession.sharedInstance().setActive(true)
                let newPlayer = try AVAudioPlayer(contentsOf: localURL)
                newPlayer.play()
                player = newPlayer
                isPlaying = true
                isLoading = false
                startProgressTimer()
            } catch {
                isLoading = false
                errorMessage = "Recording unavailable — the source link is offline."
            }
        }
    }

    private func startProgressTimer() {
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { _ in
            Task { @MainActor in
                guard let player, player.duration > 0 else { return }
                progress = player.currentTime / player.duration
                if !player.isPlaying {
                    isPlaying = false
                    if player.currentTime >= player.duration { progress = 0 }
                }
            }
        }
    }

    private func cachedAudio(from url: URL) async -> URL {
        let cacheDir = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
        let safeName = url.absoluteString
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: ":", with: "_")
        let localURL = cacheDir.appendingPathComponent(safeName)
        if FileManager.default.fileExists(atPath: localURL.path) { return localURL }
        do {
            let (tempURL, response) = try await URLSession.shared.download(from: url)
            let mime = (response as? HTTPURLResponse)?.mimeType ?? ""
            let status = (response as? HTTPURLResponse)?.statusCode ?? 0
            // A 200 HTML page is not an audio file (short links redirect to web pages).
            guard (200...299).contains(status), !mime.contains("text/html") else {
                throw URLError(.badServerResponse)
            }
            try FileManager.default.moveItem(at: tempURL, to: localURL)
            return localURL
        } catch {
            return url
        }
    }
}

extension String {
    /// App Transport Security blocks plain http; upgrade to https for downloads.
    func atsSafe() -> String {
        self.hasPrefix("http://") ? "https://" + dropFirst(7) : self
    }
}

// MARK: - YouTube embed

struct VideoEmbedView: View {
    let videoUrl: String

    var body: some View {
        if let id = youTubeID(from: videoUrl) {
            YouTubeWebView(videoID: id)
                .frame(height: 220)
                .overlay(RoundedRectangle(cornerRadius: 18).strokeBorder(Color.white.opacity(0.12)))
                .clipShape(RoundedRectangle(cornerRadius: 18))
        }
    }
}

private struct YouTubeWebView: UIViewRepresentable {
    let videoID: String

    /// YouTube's embed requires a valid HTTP Referer identifying the embedding
    /// site; a null/file origin makes the player fail with error 153. Loading
    /// the wrapper HTML with an https baseURL gives the iframe that referer.
    static let embedOrigin = "https://soundscape-sydney.rork.app"

    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.isScrollEnabled = false
        let html = """
        <!doctype html><html><head><meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <style>html,body{margin:0;padding:0;background:#050812;overflow:hidden}
        iframe{width:100%;height:100%;border:0}</style></head>
        <body><iframe src="https://www.youtube-nocookie.com/embed/\(videoID)?playsinline=1&rel=0&origin=\(Self.embedOrigin.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;webshare"
        allowfullscreen></iframe></body></html>
        """
        webView.loadHTMLString(html, baseURL: URL(string: Self.embedOrigin))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}
}
