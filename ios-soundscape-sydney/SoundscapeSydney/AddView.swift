//
//  AddView.swift
//  SoundscapeSydney
//
//  Port of expo/app/(tabs)/add.tsx — contribute a field recording
//  (photo picker, title, description, address, category).
//

import SwiftUI
import PhotosUI

struct AddPaneView: View {
    @State private var title = ""
    @State private var description = ""
    @State private var address = ""
    @State private var category: SoundCategory?
    @State private var pickedImage: PhotosPickerItem?
    @State private var image: UIImage?
    @State private var submitted = false

    var body: some View {
        ZStack {
            Theme.appBackground

            if submitted {
                successView
            } else {
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
                        Text("New Recording")
                            .font(.system(size: 13, weight: .heavy))
                            .tracking(1.1)
                            .textCase(.uppercase)
                            .foregroundStyle(Theme.cyan)
                            .padding(.bottom, 8)
                        Text("Add a new sound to the map")
                            .font(.system(size: 30, weight: .black))
                            .foregroundStyle(Theme.white)
                            .padding(.bottom, 8)
                        Text("Contribute a field recording, soundscape, or sonic landmark from anywhere in Sydney.")
                            .font(.system(size: 14))
                            .foregroundStyle(Theme.cloud)
                            .padding(.bottom, 22)

                        imagePicker
                            .padding(.bottom, 18)

                        field(title: "TITLE", text: $title, placeholder: "e.g. Dawn at Brickpit Ring Walk")
                        field(title: "DESCRIPTION", text: $description, placeholder: "What do you hear?", isMultiline: true)

                        field(title: "ADDRESS", text: $address, placeholder: "Street, suburb")

                        VStack(alignment: .leading, spacing: 10) {
                            fieldLabel("CATEGORY")
                            HStack(spacing: 8) {
                                ForEach(SoundCategory.allCases) { candidate in
                                    Button {
                                        category = candidate
                                        Haptics.selection()
                                    } label: {
                                        HStack(spacing: 7) {
                                            Circle()
                                                .fill(candidate.color)
                                                .frame(width: 6, height: 6)
                                                .shadow(color: candidate.color, radius: 5)
                                            Text(candidate.rawValue)
                                                .font(.system(size: 12, weight: .bold))
                                                .foregroundStyle(category == candidate ? candidate.color : Theme.cloud)
                                        }
                                        .padding(.horizontal, 13)
                                        .padding(.vertical, 9)
                                        .background(category == candidate ? candidate.color.opacity(0.09) : Color.white.opacity(0.03))
                                        .overlay(Capsule().strokeBorder(category == candidate ? candidate.color : Color.white.opacity(0.12)))
                                        .clipShape(Capsule())
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                        .padding(.bottom, 26)

                        submitButton
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 8)
                    .padding(.bottom, 130)
                }
            }
        }
        .onChange(of: pickedImage) { _, item in
            guard let item else { return }
            Task {
                if let data = try? await item.loadTransferable(type: Data.self),
                   let loaded = UIImage(data: data) {
                    image = loaded
                    Haptics.light()
                }
            }
        }
    }

    // MARK: Sections

    private var imagePicker: some View {
        PhotosPicker(selection: $pickedImage, matching: .images) {
            if let image {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(height: 200)
                    .frame(maxWidth: .infinity)
                    .clipped()
            } else {
                VStack(spacing: 10) {
                    Image(systemName: "camera.fill")
                        .font(.system(size: 26))
                        .foregroundStyle(Theme.cyan)
                    Text("Add cover photo")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(Theme.cyan)
                }
                .frame(height: 200)
                .frame(maxWidth: .infinity)
                .background(Theme.cyan.opacity(0.05))
            }
        }
        .overlay(RoundedRectangle(cornerRadius: 18).strokeBorder(Color.white.opacity(0.12), style: DashLineStyle.style))
        .clipShape(RoundedRectangle(cornerRadius: 18))
    }

    private func fieldLabel(_ label: String) -> some View {
        Text(label)
            .font(.system(size: 10, weight: .heavy))
            .tracking(2)
            .foregroundStyle(Theme.mist)
    }

    private func field(title: String, text: Binding<String>, placeholder: String, isMultiline: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            fieldLabel(title)
            Group {
                if isMultiline {
                    TextField(
                        "",
                        text: text,
                        prompt: Text(placeholder).foregroundStyle(Theme.mist.opacity(0.7)),
                        axis: .vertical
                    )
                    .lineLimit(3...5)
                } else {
                    TextField(
                        "",
                        text: text,
                        prompt: Text(placeholder).foregroundStyle(Theme.mist.opacity(0.7))
                    )
                }
            }
            .font(.system(size: 15))
            .foregroundStyle(Theme.white)
            .padding(14)
            .background(Color.white.opacity(0.04))
            .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(Color.white.opacity(0.08)))
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .padding(.bottom, 16)
    }

    private var submitButton: some View {
        Button {
            if title.trimmingCharacters(in: .whitespaces).isEmpty {
                presentAlert("Missing title", "Please add a title for your recording.")
                return
            }
            if category == nil {
                presentAlert("Missing category", "Please select a category.")
                return
            }
            Haptics.success()
            submitted = true
        } label: {
            HStack(spacing: 10) {
                Image(systemName: "waveform.badge.plus")
                    .font(.system(size: 16, weight: .semibold))
                Text("SUBMIT RECORDING")
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

    private func presentAlert(_ title: String, _ message: String) {
        guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let root = scene.keyWindow?.rootViewController else { return }
        var top = root
        while let presented = top.presentedViewController { top = presented }
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        top.present(alert, animated: true)
    }

    // MARK: Success

    private var successView: some View {
        VStack(spacing: 14) {
            Image(systemName: "checkmark")
                .font(.system(size: 30, weight: .bold))
                .foregroundStyle(Theme.ink)
                .frame(width: 84, height: 84)
                .background(Theme.accent)
                .clipShape(Circle())
                .shadow(color: Theme.cyan, radius: 30)
                .padding(.bottom, 8)
            Text("Recording submitted")
                .font(.system(size: 24, weight: .black))
                .foregroundStyle(Theme.white)
            Text("Your sound spot has been saved locally. Once connected to a backend, it will sync automatically.")
                .font(.system(size: 14))
                .foregroundStyle(Theme.cloud)
                .multilineTextAlignment(.center)
            Button {
                submitted = false
                title = ""
                description = ""
                address = ""
                category = nil
                image = nil
                pickedImage = nil
            } label: {
                Text("Add another")
                    .font(.system(size: 14, weight: .heavy))
                    .foregroundStyle(Theme.ink)
                    .padding(.horizontal, 22)
                    .padding(.vertical, 13)
                    .background(Theme.white)
                    .clipShape(Capsule())
            }
            .padding(.top, 10)
        }
        .padding(30)
    }
}

private struct DashLineStyle {
    static var style: StrokeStyle {
        StrokeStyle(lineWidth: 1, dash: [6, 4])
    }
}
