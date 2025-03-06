<p align="center">
  <a>
    <img width="180" src="./apps/app/src-tauri/recorder-state-icons/studio_microphone.png" alt="Whispering">
    </a>
  <h1 align="center">WhisperingX</h1>
  <p align="center">A fork from <a href="https://whispering.bradenwong.com">whispering</a></p>
</p>

## About

WhisperingX is a minimalist transcription tool forked from the open-source project <a href="https://whispering.bradenwong.com">Whispering</a>. Built with a focus on accuracy and simplicity, WhisperingX strips away unnecessary features and code from its predecessor, offering a streamlined experience for users who need reliable audio-to-text conversion.


## Build Executables with private key
- Open a new powershell in projects root
- type the following command: `$env:TAURI_SIGNING_PRIVATE_KEY="Your private key"` (env variables do not persist across terminals)
- type: `$env:TAURI_SIGNING_PRIVATE_KEY` It should return your private key.
- in the same powershell type: `npm run tauri build`.