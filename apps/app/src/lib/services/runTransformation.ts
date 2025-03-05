import { settings } from '$lib/stores/settings.svelte';
import { getErrorMessage } from '$lib/utils';
import { Err, Ok, type Result, tryAsync } from '@epicenterhq/result';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { POST_PROCESSING_PROMPT_SYSTEM_DEFAULT, POST_PROCESSING_PROMPT_USER_DEFAULT, WhisperingErr, type PostProcessingConfig } from '@repo/shared';
import { z } from 'zod';
import type { HttpService } from './http/HttpService';

type TransformErrorProperties = {
	_tag: 'TransformError';
	code:
		| 'RECORDING_NOT_FOUND'
		| 'NO_INPUT'
		| 'TRANSFORMATION_NOT_FOUND'
		| 'NO_STEPS_CONFIGURED'
		| 'FAILED_TO_CREATE_TRANSFORMATION_RUN'
		| 'FAILED_TO_ADD_TRANSFORMATION_STEP_RUN'
		| 'FAILED_TO_MARK_TRANSFORMATION_RUN_AND_STEP_AS_FAILED'
		| 'FAILED_TO_MARK_TRANSFORMATION_RUN_STEP_AS_COMPLETED'
		| 'FAILED_TO_MARK_TRANSFORMATION_RUN_AS_COMPLETED';
};

export type TransformError = Err<TransformErrorProperties>;
export type TransformResult<T> = Ok<T> | TransformError;

export const TransformErrorToWhisperingErr = ({ error }: TransformError) => {
	switch (error.code) {
		case 'NO_INPUT':
			return WhisperingErr({
				title: '⚠️ Empty input',
				description: 'Please enter some text to transform',
			});
		case 'RECORDING_NOT_FOUND':
			return WhisperingErr({
				title: '⚠️ Recording not found',
				description: 'Could not find the selected recording.',
			});
		case 'TRANSFORMATION_NOT_FOUND':
			return WhisperingErr({
				title: '⚠️ Transformation not found',
				description: 'Could not find the selected transformation.',
			});
		case 'NO_STEPS_CONFIGURED':
			return WhisperingErr({
				title: 'No steps configured',
				description: 'Please add at least one transformation step',
			});
		case 'FAILED_TO_CREATE_TRANSFORMATION_RUN':
			return WhisperingErr({
				title: '⚠️ Failed to create transformation run',
				description: 'Could not create the transformation run.',
			});
		case 'FAILED_TO_ADD_TRANSFORMATION_STEP_RUN':
			return WhisperingErr({
				title: '⚠️ Failed to add transformation step run',
				description: 'Could not add the transformation step run.',
			});
		case 'FAILED_TO_MARK_TRANSFORMATION_RUN_AND_STEP_AS_FAILED':
			return WhisperingErr({
				title: '⚠️ Failed to mark transformation run and step as failed',
				description:
					'Could not mark the transformation run and step as failed.',
			});
		case 'FAILED_TO_MARK_TRANSFORMATION_RUN_STEP_AS_COMPLETED':
			return WhisperingErr({
				title: '⚠️ Failed to mark transformation run step as completed',
				description: 'Could not mark the transformation run step as completed.',
			});
		case 'FAILED_TO_MARK_TRANSFORMATION_RUN_AS_COMPLETED':
			return WhisperingErr({
				title: '⚠️ Failed to mark transformation run as completed',
				description: 'Could not mark the transformation run as completed.',
			});
	}
};

export const TransformError = <
	T extends Omit<TransformErrorProperties, '_tag'>,
>(
	properties: T,
) =>
	Err({
		_tag: 'TransformError',
		...properties,
	}) satisfies TransformError;

export const handleStep = async ({
	input,
	config,
	HttpService,
}: {
	input: string;
	config: PostProcessingConfig;
	HttpService: HttpService;
}): Promise<Result<string, string>> => {
	switch (config.type) {
		case 'find_replace': {
			const findText = config['find_replace.findText'];
			const replaceText = config['find_replace.replaceText'];
			const useRegex = config['find_replace.useRegex'];

			if (useRegex) {
				try {
					const regex = new RegExp(findText, 'g');
					return Ok(input.replace(regex, replaceText));
				} catch (error) {
					return Err(`Invalid regex pattern: ${getErrorMessage(error)}`);
				}
			}

			return Ok(input.replaceAll(findText, replaceText));
		}

		case 'prompt_transform': {
			const vocabulary = settings.value['transcription.vocabulary'];
			const provider = config['prompt_transform.inference.provider'];
			const rawSystemPrompt = config['prompt_transform.systemPromptTemplate'];
			const systemPrompt = (
				rawSystemPrompt.trim().length > 0
					? rawSystemPrompt.trim()
					: POST_PROCESSING_PROMPT_SYSTEM_DEFAULT
			)
				.replace('{{input}}', input)
				.replace('{{vocabulary}}', vocabulary);
			const rawUserPrompt = config['prompt_transform.userPromptTemplate'];
			const userPrompt = (
				rawUserPrompt.trim().length > 0
					? rawUserPrompt.trim()
					: POST_PROCESSING_PROMPT_USER_DEFAULT
			)
				.replace('{{input}}', input)
				.replace('{{vocabulary}}', vocabulary);

			switch (provider) {
				case 'OpenAI': {
					const model =
						config['prompt_transform.inference.provider.OpenAI.model'];
					const result = await HttpService.post({
						url: 'https://api.openai.com/v1/chat/completions',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${settings.value['apiKeys.openai']}`,
						},
						body: JSON.stringify({
							model,
							messages: [
								{ role: 'system', content: systemPrompt },
								{ role: 'user', content: userPrompt },
							],
						}),
						schema: z.object({
							choices: z.array(
								z.object({
									message: z.object({
										content: z.string(),
									}),
								}),
							),
						}),
					});

					if (!result.ok) {
						const { error, code } = result.error;
						return Err(`OpenAI API Error: ${getErrorMessage(error)} (${code})`);
					}

					const responseText = result.data.choices[0]?.message?.content;
					if (!responseText) {
						return Err('OpenAI API returned an empty response');
					}

					return Ok(responseText);
				}

				case 'Groq': {
					const model = config['prompt_transform.inference.provider.Groq.model'];
					const result = await HttpService.post({
						url: 'https://api.groq.com/openai/v1/chat/completions',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${settings.value['apiKeys.groq']}`,
						},
						body: JSON.stringify({
							model,
							messages: [
								{ role: 'system', content: systemPrompt },
								{ role: 'user', content: userPrompt },
							],
						}),
						schema: z.object({
							choices: z.array(
								z.object({
									message: z.object({
										content: z.string(),
									}),
								}),
							),
						}),
					});

					if (!result.ok) {
						const { error, code } = result.error;
						return Err(`Groq API Error: ${getErrorMessage(error)} (${code})`);
					}

					const responseText = result.data.choices[0]?.message?.content;
					if (!responseText) {
						return Err('Groq API returned an empty response');
					}

					return Ok(responseText);
				}

				case 'Anthropic': {
					const model =
						config['prompt_transform.inference.provider.Anthropic.model'];
					const result = await HttpService.post({
						url: 'https://api.anthropic.com/v1/messages',
						headers: {
							'Content-Type': 'application/json',
							'anthropic-version': '2023-06-01',
							'x-api-key': settings.value['apiKeys.anthropic'],
							'anthropic-dangerous-direct-browser-access': 'true',
						},
						body: JSON.stringify({
							model,
							system: systemPrompt,
							messages: [{ role: 'user', content: userPrompt }],
							max_tokens: 1024,
						}),
						schema: z.object({
							content: z.array(
								z.object({
									type: z.literal('text'),
									text: z.string(),
								}),
							),
						}),
					});

					if (!result.ok) {
						const { error, code } = result.error;
						return Err(
							`Anthropic API Error: ${getErrorMessage(error)} (${code})`,
						);
					}

					const responseText = result.data.content[0]?.text;
					if (!responseText) {
						return Err('Anthropic API returned an empty response');
					}

					return Ok(responseText);
				}

				case 'Google': {
					const combinedPrompt = `${systemPrompt}\n${userPrompt}`;

					const result = await tryAsync({
						try: async () => {
							const genAI = new GoogleGenerativeAI(
								settings.value['apiKeys.google'],
							);

							const model = genAI.getGenerativeModel({
								model: config['prompt_transform.inference.provider.Google.model'],
								generationConfig: { temperature: 0 },
							});
							return await model.generateContent(combinedPrompt);
						},
						mapErr: (error) => {
							return Err(getErrorMessage(error));
						},
					});
					if (!result.ok) return result;

					const responseText = result.data.response.text();

					if (!responseText) {
						return Err('Google API returned an empty response');
					}

					return Ok(responseText);
				}

				default:
					return Err(`Unsupported provider: ${provider}`);
			}
		}

		default:
			return Err(`Unsupported step type: ${config.type}`);
	}
};

export function createRunTransformationService({
	HttpService,
}: {
	HttpService: HttpService;
}) {
	const runTransformation = async ({
		input,
		config,
	}: {
		input: string;
		config: PostProcessingConfig;
	}): Promise<TransformResult<string>> => {
		const handleStepResult = await handleStep({
			input,
			config,
			HttpService,
		});

		if (!handleStepResult.ok) {
			return TransformError({
				code: 'FAILED_TO_ADD_TRANSFORMATION_STEP_RUN',
			});
		}

		return Ok(handleStepResult.data);
	};

	return {
		runTransformation: async ({
			input,
			config,
		}: {
			input: string;
			config: PostProcessingConfig;
		}): Promise<TransformResult<string>> => {
			if (!input.trim()) {
				return TransformError({ code: 'NO_INPUT' });
			}
			return runTransformation({
				input,
				config,
			});
		},
	};
}
