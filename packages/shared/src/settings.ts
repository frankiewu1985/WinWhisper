import { type ZodBoolean, z } from 'zod';
import {
	ALWAYS_ON_TOP_VALUES,
	ANTHROPIC_INFERENCE_MODELS,
	BITRATE_VALUES_KBPS,
	DEFAULT_BITRATE_KBPS,
	GOOGLE_INFERENCE_MODELS,
	GROQ_INFERENCE_MODELS,
	GROQ_MODELS,
	INFERENCE_PROVIDERS,
	OPENAI_INFERENCE_MODELS,
	POST_PROCESSING_PROMPT_SYSTEM_DEFAULT,
	POST_PROCESSING_PROMPT_USER_DEFAULT,
	SUPPORTED_LANGUAGES,
	TRANSCRIPTION_SERVICES,
	TRANSFORMATION_STEP_TYPES,
	type WhisperingSoundNames,
} from './constants.js';

export const getDefaultSettings = () =>
  ({
    "sound.playOn.start": true,
    "sound.playOn.stop": true,
    "sound.playOn.cancel": true,
    "sound.playOn.transcriptionComplete": true,
    "sound.playOn.transformationComplete": true,
    "transcription.copyToClipboardOnSuccess": false,
    "transcription.insertToCursorOnSuccess": true,
    "recording.isFasterRerecordEnabled": false,
    "system.closeToTray": true,
    "system.alwaysOnTop": "Never",

    // Recording retention defaults
    "database.recordingRetentionStrategy": "keep-forever",
    "database.maxRecordingCount": "5",

    "recording.selectedAudioInputDeviceId": "default",
    "recording.bitrateKbps": DEFAULT_BITRATE_KBPS,

    "transcription.selectedTranscriptionService": "OpenAI",
    "transcription.groq.model": "whisper-large-v3",
    "transcription.outputLanguage": "auto",
    "transcription.outputLanguage1": "auto",
    "transcription.outputLanguage2": "auto",
    "transcription.outputLanguage3": "auto",
    "transcription.prompt": "",
    "transcription.vocabulary": "",
    "transcription.temperature": "0",

    "transcription.fasterWhisperServer.serverUrl": "http://localhost:8000",
    "transcription.fasterWhisperServer.serverModel":
      "Systran/faster-whisper-medium.en",

    "transformations.selectedTransformationId": null,
    "postProcessing.config": {
      id: "8uAZZtxwjXIymnkjosAh5",
      type: "prompt_transform",
      "prompt_transform.inference.provider": "Groq",
      "prompt_transform.inference.provider.OpenAI.model": "gpt-4o",
      "prompt_transform.inference.provider.Groq.model":
        "llama-3.3-70b-versatile",
      "prompt_transform.inference.provider.Anthropic.model":
        "claude-3-5-sonnet-latest",
      "prompt_transform.inference.provider.Google.model": "gemini-2.0-flash",
      "prompt_transform.systemPromptTemplate": POST_PROCESSING_PROMPT_SYSTEM_DEFAULT,
      "prompt_transform.userPromptTemplate": POST_PROCESSING_PROMPT_USER_DEFAULT,
      "find_replace.findText": "",
      "find_replace.replaceText": "",
      "find_replace.useRegex": false,
    },

    "apiKeys.openai": "",
    "apiKeys.anthropic": "",
    "apiKeys.groq": "",
    "apiKeys.google": "",

    "shortcuts.currentLocalShortcut": "space",
    "shortcuts.currentGlobalShortcut": "CommandOrControl+Shift+;",
    "shortcuts.currentGlobalShortcut1": "CommandOrControl+Shift+1",
    "shortcuts.currentGlobalShortcut2": "CommandOrControl+Shift+2",
    "shortcuts.currentGlobalShortcut3": "CommandOrControl+Shift+3",
  }) satisfies Settings;

export const settingsSchema = z.object({
	...({
		'sound.playOn.start': z.boolean(),
		'sound.playOn.stop': z.boolean(),
		'sound.playOn.cancel': z.boolean(),
		'sound.playOn.transcriptionComplete': z.boolean(),
		'sound.playOn.transformationComplete': z.boolean(),
	} satisfies {
		[K in WhisperingSoundNames as `sound.playOn.${K}`]: ZodBoolean;
	}),

	'transcription.copyToClipboardOnSuccess': z.boolean(),
	'transcription.insertToCursorOnSuccess': z.boolean(),
	'recording.isFasterRerecordEnabled': z.boolean(),

	'system.closeToTray': z.boolean(),
	'system.alwaysOnTop': z.enum(ALWAYS_ON_TOP_VALUES),

	'database.recordingRetentionStrategy': z.enum([
		'keep-forever',
		'limit-count',
	] as const),
	'database.maxRecordingCount': z.string().regex(/^\d+$/, 'Must be a number'),

	'recording.selectedAudioInputDeviceId': z.string().nullable(),
	'recording.bitrateKbps': z
		.enum(BITRATE_VALUES_KBPS)
		.optional()
		.default(DEFAULT_BITRATE_KBPS),

	// Shared transcription settings
	'transcription.selectedTranscriptionService': z.enum(TRANSCRIPTION_SERVICES),
	'transcription.outputLanguage': z.enum(SUPPORTED_LANGUAGES),
	'transcription.outputLanguage1': z.enum(SUPPORTED_LANGUAGES),
	'transcription.outputLanguage2': z.enum(SUPPORTED_LANGUAGES),
	'transcription.outputLanguage3': z.enum(SUPPORTED_LANGUAGES),
	'transcription.prompt': z.string(),
	'transcription.vocabulary': z.string(),
	'transcription.temperature': z.string(),

	// Service-specific settings
	'transcription.groq.model': z.enum(GROQ_MODELS),
	'transcription.fasterWhisperServer.serverUrl': z.string(),
	'transcription.fasterWhisperServer.serverModel': z.string(),

	'transformations.selectedTransformationId': z.string().nullable(),
	'postProcessing.config': z.object({
		id: z.string(),
		type: z.enum(TRANSFORMATION_STEP_TYPES),

		'prompt_transform.inference.provider': z.enum(INFERENCE_PROVIDERS),
		'prompt_transform.inference.provider.OpenAI.model': z.enum(OPENAI_INFERENCE_MODELS),
		'prompt_transform.inference.provider.Groq.model': z.enum(GROQ_INFERENCE_MODELS),
		'prompt_transform.inference.provider.Anthropic.model': z.enum(ANTHROPIC_INFERENCE_MODELS),
		'prompt_transform.inference.provider.Google.model': z.enum(GOOGLE_INFERENCE_MODELS),

		'prompt_transform.systemPromptTemplate': z.string(),
		'prompt_transform.userPromptTemplate': z.string(),

		'find_replace.findText': z.string(),
		'find_replace.replaceText': z.string(),
		'find_replace.useRegex': z.boolean(),
	}),

	'apiKeys.openai': z.string(),
	'apiKeys.anthropic': z.string(),
	'apiKeys.groq': z.string(),
	'apiKeys.google': z.string(),

	'shortcuts.currentLocalShortcut': z.string(),
	'shortcuts.currentGlobalShortcut': z.string(),
	'shortcuts.currentGlobalShortcut1': z.string(),
	'shortcuts.currentGlobalShortcut2': z.string(),
	'shortcuts.currentGlobalShortcut3': z.string(),
});

export type Settings = z.infer<typeof settingsSchema>;
