<p align="center">
  <a>
    <img width="180" src="./apps/app/src-tauri/recorder-state-icons/studio_microphone.png" alt="Whispering">
    </a>
  <h1 align="center">WhisperingX</h1>
  <p align="center">A fork from <a href="https://whispering.bradenwong.com">whispering</a></p>
</p>

## About

WhisperingX is a minimalist transcription tool forked from the open-source project <a href="https://whispering.bradenwong.com">Whispering</a>. Built with a focus on accuracy and simplicity, WhisperingX strips away unnecessary features and code from its predecessor, offering a streamlined experience for users who need reliable audio-to-text conversion.

# Quick Start
1. Go to Settings.

<img src="./doc/images/main.png" alt="Settings" width="500">

2. Set API keys.

<img src="./doc/images/API.png" alt="API keys" width="500">

3. Set transcription model

<img src="./doc/images/transcribe.png" alt="Transcription model" width="500">

4. Set post processing model (LLM model)

<img src="./doc/images/postProcessing.png" alt="Post processing model" width="500">

5. Set global shortcut

<img src="./doc/images/shortcut.png" alt="Global shortcut" width="500">

6. Minimize it to the tray

<img src="./doc/images/minimize.png" alt="Minimize to tray" width="500">

7. Press and hold the shortcut key, and try it out!

<img src="./doc/images/tryOut.png" alt="Try it out" width="500">

## Build Executables with private key
- Open a new powershell in projects root
- type the following command: `$env:TAURI_SIGNING_PRIVATE_KEY="Your private key"` (env variables do not persist across terminals)
- type: `$env:TAURI_SIGNING_PRIVATE_KEY` It should return your private key.
- in the same powershell type: `npm run tauri build`.