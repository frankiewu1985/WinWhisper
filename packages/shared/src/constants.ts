import { z } from 'zod';

export const WHISPERING_URL =
	process.env.NODE_ENV === 'production'
		? 'https://whispering.bradenwong.com'
		: 'http://localhost:5173';

export const DEBOUNCE_TIME_MS = 1000;

export const BITRATE_VALUES_KBPS = [
	'16',
	'32',
	'64',
	'96',
	'128',
	'192',
	'256',
	'320',
] as const;

export const BITRATE_OPTIONS = BITRATE_VALUES_KBPS.map((bitrate) => ({
	label: `${bitrate} kbps`,
	value: bitrate,
}));

export const DEFAULT_BITRATE_KBPS =
	'128' as const satisfies (typeof BITRATE_VALUES_KBPS)[number];

export const ALWAYS_ON_TOP_VALUES = [
	'Always',
	'When Recording and Transcribing',
	'When Recording',
	'Never',
] as const;

export const ALWAYS_ON_TOP_OPTIONS = ALWAYS_ON_TOP_VALUES.map((option) => ({
	label: option,
	value: option,
}));

export const recordingStateSchema = z.enum([
	'IDLE',
	'SESSION',
	'SESSION+RECORDING',
]);

export type WhisperingRecordingState = z.infer<typeof recordingStateSchema>;

export const recorderStateToIcons = {
	IDLE: '🎙️',
	SESSION: '🎙️',
	'SESSION+RECORDING': '⏹️',
} as const satisfies Record<WhisperingRecordingState, string>;

/** Supported languages pulled from OpenAI Website: https://platform.openai.com/docs/guides/speech-to-text/supported-languages */
export const SUPPORTED_LANGUAGES = [
	'auto',
	'af',
	'ar',
	'hy',
	'az',
	'be',
	'bs',
	'bg',
	'ca',
	'zh',
	'hr',
	'cs',
	'da',
	'nl',
	'en',
	'et',
	'fi',
	'fr',
	'gl',
	'de',
	'el',
	'he',
	'hi',
	'hu',
	'is',
	'id',
	'it',
	'ja',
	'kn',
	'kk',
	'ko',
	'lv',
	'lt',
	'mk',
	'ms',
	'mr',
	'mi',
	'ne',
	'no',
	'fa',
	'pl',
	'pt',
	'ro',
	'ru',
	'sr',
	'sk',
	'sl',
	'es',
	'sw',
	'sv',
	'tl',
	'ta',
	'th',
	'tr',
	'uk',
	'ur',
	'vi',
	'cy',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const TRANSCRIPTION_SERVICES = [
	'OpenAI',
	'Groq',
	'faster-whisper-server',
] as const;

export const TRANSCRIPTION_SERVICE_OPTIONS = TRANSCRIPTION_SERVICES.map(
	(service) => ({
		value: service,
		label: service,
	}),
);

const SUPPORTED_LANGUAGES_TO_LABEL = {
	auto: 'Auto',
	af: 'Afrikaans',
	ar: 'Arabic',
	hy: 'Armenian',
	az: 'Azerbaijani',
	be: 'Belarusian',
	bs: 'Bosnian',
	bg: 'Bulgarian',
	ca: 'Catalan',
	zh: 'Chinese',
	hr: 'Croatian',
	cs: 'Czech',
	da: 'Danish',
	nl: 'Dutch',
	en: 'English',
	et: 'Estonian',
	fi: 'Finnish',
	fr: 'French',
	gl: 'Galician',
	de: 'German',
	el: 'Greek',
	he: 'Hebrew',
	hi: 'Hindi',
	hu: 'Hungarian',
	is: 'Icelandic',
	id: 'Indonesian',
	it: 'Italian',
	ja: 'Japanese',
	kn: 'Kannada',
	kk: 'Kazakh',
	ko: 'Korean',
	lv: 'Latvian',
	lt: 'Lithuanian',
	mk: 'Macedonian',
	ms: 'Malay',
	mr: 'Marathi',
	mi: 'Maori',
	ne: 'Nepali',
	no: 'Norwegian',
	fa: 'Persian',
	pl: 'Polish',
	pt: 'Portuguese',
	ro: 'Romanian',
	ru: 'Russian',
	sr: 'Serbian',
	sk: 'Slovak',
	sl: 'Slovenian',
	es: 'Spanish',
	sw: 'Swahili',
	sv: 'Swedish',
	tl: 'Tagalog',
	ta: 'Tamil',
	th: 'Thai',
	tr: 'Turkish',
	uk: 'Ukrainian',
	ur: 'Urdu',
	vi: 'Vietnamese',
	cy: 'Welsh',
} as const satisfies Record<SupportedLanguage, string>;

export const SUPPORTED_LANGUAGES_OPTIONS = SUPPORTED_LANGUAGES.map(
	(lang) =>
		({ label: SUPPORTED_LANGUAGES_TO_LABEL[lang], value: lang }) as const,
);

export const INFERENCE_PROVIDERS = [
	'OpenAI',
	'Groq',
	'Anthropic',
	'Google',
] as const;

export const GROQ_MODELS = [
	'whisper-large-v3',
	'whisper-large-v3-turbo',
	'distil-whisper-large-v3-en',
] as const;

export const GROQ_MODELS_OPTIONS = GROQ_MODELS.map((model) => ({
	value: model,
	label: model,
}));

export const INFERENCE_PROVIDER_OPTIONS = INFERENCE_PROVIDERS.map(
	(provider) => ({
		value: provider,
		label: provider,
	}),
);

// https://platform.openai.com/docs/models
export const OPENAI_INFERENCE_MODELS = [
	'gpt-4o',
	'gpt-4o-mini',
	'gpt-3.5-turbo',
] as const;

export const OPENAI_INFERENCE_MODEL_OPTIONS = OPENAI_INFERENCE_MODELS.map(
	(model) => ({
		value: model,
		label: model,
	}),
);

// https://console.groq.com/docs/models
export const GROQ_INFERENCE_MODELS = ['llama-3.3-70b-versatile'] as const;

export const GROQ_INFERENCE_MODEL_OPTIONS = GROQ_INFERENCE_MODELS.map(
	(model) => ({
		value: model,
		label: model,
	}),
);

// https://docs.anthropic.com/claude/docs/models-overview
export const ANTHROPIC_INFERENCE_MODELS = [
	'claude-3-7-sonnet-latest',
	'claude-3-5-sonnet-latest',
	'claude-3-5-haiku-latest',
	'claude-3-opus-latest',
	'claude-3-sonnet-latest',
	'claude-3-haiku-latest',
] as const;

export const ANTHROPIC_INFERENCE_MODEL_OPTIONS = ANTHROPIC_INFERENCE_MODELS.map(
	(model) => ({
		value: model,
		label: model,
	}),
);

export const GOOGLE_INFERENCE_MODELS = [
	'gemini-2.0-pro',
	'gemini-2.0-flash',
	'gemini-2.0-flash-thinking',
	'gemini-2.0-flash-lite-preview',
] as const;

export const GOOGLE_INFERENCE_MODEL_OPTIONS = GOOGLE_INFERENCE_MODELS.map(
	(model) => ({
		value: model,
		label: model,
	}),
);

export type WhisperingSoundNames =
	| 'start'
	| 'stop'
	| 'start-vad'
	| 'start-manual'
	| 'stop-manual'
	| 'on-stopped-voice-activated-session'
	| 'cancel'
	| 'transcriptionComplete';


export const TRANSFORMATION_STEP_TYPES = [
	'prompt_transform',
	'find_replace',
	'none',
] as const;


export const TRANSCRIPTION_PROMPT_DEFAULT = `Transcribe the provided audio input with high accuracy, preserving the original language as spoken, without translating any part of the text into another language, even if multiple languages are present. Prioritize capturing the exact wording, including dialects and natural speech patterns. Incorporate the following custom vocabulary, favoring these words when their pronunciation and audio context match: [{{vocabulary}}]. If audio quality is poor or contains background noise, use contextual clues to interpret the most likely spoken content without altering the language.`;
export const POST_PROCESSING_PROMPT_SYSTEM_DEFAULT = `Refine transcriptions to produce an accurate representation of what was said in the original audio, preserving the original language without any translation. Remove hesitations and filler words (e.g., 'um,' 'uh,' 'you know') while maintaining the natural flow and meaning of the speech. Use the following custom vocabulary to correct or favor these words when appropriate based on context and their provided explanations: [{{vocabulary}}]. Return only the corrected transcription as a single string, with no additional text or explanation.`;
export const POST_PROCESSING_PROMPT_USER_DEFAULT = `Here’s the transcription to refine: '{{input}}' Please process it according to the guidelines.`;

export type Recording = {
	blob: Blob | undefined;
};

export type PostProcessingConfig = {
	id: string;
	// For now, steps don't need titles or descriptions. They can be computed from the type as "Find and Replace" or "Prompt Transform"
	type: (typeof TRANSFORMATION_STEP_TYPES)[number];

	'prompt_transform.inference.provider': (typeof INFERENCE_PROVIDERS)[number];
	'prompt_transform.inference.provider.OpenAI.model': (typeof OPENAI_INFERENCE_MODELS)[number];
	'prompt_transform.inference.provider.Groq.model': (typeof GROQ_INFERENCE_MODELS)[number];
	'prompt_transform.inference.provider.Anthropic.model': (typeof ANTHROPIC_INFERENCE_MODELS)[number];
	'prompt_transform.inference.provider.Google.model': (typeof GOOGLE_INFERENCE_MODELS)[number];

	'prompt_transform.systemPromptTemplate': string;
	'prompt_transform.userPromptTemplate': string;

	'find_replace.findText': string;
	'find_replace.replaceText': string;
	'find_replace.useRegex': boolean;
};

export const TRANSFORMATION_STEP_TYPES_TO_LABELS = {
	prompt_transform: 'Prompt Transform',
	find_replace: 'Find Replace',
	none: 'None',
} as const satisfies Record<(typeof TRANSFORMATION_STEP_TYPES)[number], string>;