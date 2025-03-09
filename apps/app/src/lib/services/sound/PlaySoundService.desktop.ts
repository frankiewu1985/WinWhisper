import { Ok } from '@epicenterhq/result';
import type { WhisperingSoundNames } from '@repo/shared';
import type { PlaySoundService } from './PlaySoundService';
import stopSoundSrc from './assets/sound_ex_machina_Button_Blip.mp3';
import startManualSoundSrc from './assets/zapsplat_household_alarm_clock_button_press_12967.mp3';
import onSpeechEndSoundSrc from './assets/zapsplat_household_alarm_clock_large_snooze_button_press_001_12968.mp3';
import startVadSoundSrc from './assets/zapsplat_household_alarm_clock_large_snooze_button_press_002_12969.mp3';
import errorSoundSrc from './assets/zapsplat_multimedia_alert_notification_ui_ping_chime_mallet_like_error_006_65667.mp3';
import cancelSoundSrc from './assets/zapsplat_multimedia_click_button_short_sharp_73510.mp3';
import transcriptionCompleteSoundSrc from './assets/zapsplat_multimedia_ui_notification_classic_bell_synth_success_107505.mp3';

const sounds = {
	'start': new Audio(startManualSoundSrc),
	'start-vad': new Audio(startVadSoundSrc),
	'start-manual': new Audio(startManualSoundSrc),
	'stop': new Audio(stopSoundSrc),
	'stop-manual': new Audio(stopSoundSrc),
	'on-stopped-voice-activated-session': new Audio(onSpeechEndSoundSrc),
	'error': new Audio(errorSoundSrc),
	cancel: new Audio(cancelSoundSrc),
	transcriptionComplete: new Audio(transcriptionCompleteSoundSrc),
} satisfies Record<WhisperingSoundNames, HTMLAudioElement>;

export function createPlaySoundServiceDesktop(): PlaySoundService {
	return {
		playSound: async (soundName) => {
			await sounds[soundName].play();
			return Ok(undefined);
		},
	};
}
