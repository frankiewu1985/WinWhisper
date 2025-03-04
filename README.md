<p align="center">
  <a>
    <img width="180" src="./apps/app/src-tauri/recorder-state-icons/studio_microphone.png" alt="Whispering">
    </a>
  <h1 align="center">WhisperingX</h1>
  <p align="center">A fork from <a href="https://whispering.bradenwong.com">whispering</a></p>
</p>

## About

WhisperingX is a customized fork of the open-source <a href="https://whispering.bradenwong.com">Whispering</a> project.

## Customizations

- Support press and hold to start and stop recording.
- Add a pop up indicator on the screen while recording.
- Add vocabulary setting.
- Other UX adjustments.
- Browser extension logic removed.

## Build Executables with private key
- Open a new powershell in projects root
- type the following command: `$env:TAURI_SIGNING_PRIVATE_KEY="Your private key"` (env variables do not persist across terminals)
- type: `$env:TAURI_SIGNING_PRIVATE_KEY` It should return your private key.
- in the same powershell type: `npm run tauri build`.