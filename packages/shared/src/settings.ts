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
	SUPPORTED_LANGUAGES,
	TRANSCRIPTION_SERVICES,
	TRANSFORMATION_STEP_TYPES,
	type WhisperingSoundNames,
} from './constants.js';

export const getDefaultSettings = () =>
  ({
	"sound.enabled": true,
    "transcription.copyToClipboardOnSuccess": false,
    "transcription.insertToCursorOnSuccess": true,
    "system.closeToTray": true,
    "system.alwaysOnTop": "Never",

    "recording.selectedAudioInputDeviceId": "default",
    "recording.bitrateKbps": DEFAULT_BITRATE_KBPS,

    "transcription.selectedTranscriptionService": "OpenAI",
    "transcription.groq.model": "whisper-large-v3",
    "transcription.outputLanguage": "auto",
    "transcription.prompt": '',
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
      "prompt_transform.systemPromptTemplate": '',
      "prompt_transform.userPromptTemplate": '',
      "find_replace.findText": "",
      "find_replace.replaceText": "",
      "find_replace.useRegex": false,
    },

    "apiKeys.openai": "",
    "apiKeys.anthropic": "",
    "apiKeys.groq": "",
    "apiKeys.google": "",

    "shortcuts.currentGlobalShortcut": "CommandOrControl+Shift+;",
  }) satisfies Settings;

export const settingsSchema = z.object({
	...({
		'sound.enabled': z.boolean(),
	} satisfies Partial<{
		[K in WhisperingSoundNames as `sound.playOn.${K}`]: ZodBoolean;
	}>),

	'transcription.copyToClipboardOnSuccess': z.boolean(),
	'transcription.insertToCursorOnSuccess': z.boolean(),

	'system.closeToTray': z.boolean(),
	'system.alwaysOnTop': z.enum(ALWAYS_ON_TOP_VALUES),

	'recording.selectedAudioInputDeviceId': z.string().nullable(),
	'recording.bitrateKbps': z
		.enum(BITRATE_VALUES_KBPS)
		.optional()
		.default(DEFAULT_BITRATE_KBPS),

	// Shared transcription settings
	'transcription.selectedTranscriptionService': z.enum(TRANSCRIPTION_SERVICES),
	'transcription.outputLanguage': z.enum(SUPPORTED_LANGUAGES),
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

	'shortcuts.currentGlobalShortcut': z.string(),
});

export type Settings = z.infer<typeof settingsSchema>;
