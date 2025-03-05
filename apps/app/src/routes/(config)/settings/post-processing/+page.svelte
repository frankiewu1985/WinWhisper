<script lang="ts">
	import {
		LabeledInput,
		LabeledSelect,
		LabeledSwitch,
		LabeledTextarea,
	} from '$lib/components/labeled/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import {
		ANTHROPIC_INFERENCE_MODEL_OPTIONS,
		GOOGLE_INFERENCE_MODEL_OPTIONS,
		GROQ_INFERENCE_MODEL_OPTIONS,
		INFERENCE_PROVIDER_OPTIONS,
		OPENAI_INFERENCE_MODEL_OPTIONS,
		TRANSFORMATION_STEP_TYPES,
		TRANSFORMATION_STEP_TYPES_TO_LABELS,
		type PostProcessingConfig,
	} from '@repo/shared';
	import GroqApiKeyInput from '../../-components/GroqApiKeyInput.svelte';
	import OpenAiApiKeyInput from '../../-components/OpenAiApiKeyInput.svelte';

	import * as Accordion from '$lib/components/ui/accordion';
	import AnthropicApiKeyInput from '../../-components/AnthropicApiKeyInput.svelte';
	import GoogleApiKeyInput from '../../-components/GoogleApiKeyInput.svelte';
	import { settings } from '$lib/stores/settings.svelte';

	let transformationStep: PostProcessingConfig =
		settings.value['postProcessing.config'];
	const setTransformationStep = (step: PostProcessingConfig) => {
		transformationStep = { ...step };
		settings.value['postProcessing.config'] = transformationStep;
	};
	const setTransformationStepDebounced = setTransformationStep;
</script>

<svelte:head>
	<title>Post Processing Settings</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Post Processing</h3>
		<p class="text-muted-foreground text-sm">
			Configure your post processing preferences.
		</p>
	</div>
	<Separator />

		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<LabeledSelect
					id="step-type"
					label="Type"
					selected={transformationStep.type}
					items={TRANSFORMATION_STEP_TYPES.map(
						(type) =>
							({
								value: type,
								label: TRANSFORMATION_STEP_TYPES_TO_LABELS[type],
							}) as const,
					)}
					onSelectedChange={(value) => {
						setTransformationStep({ ...transformationStep, type: value });
					}}
					hideLabel
					class="h-8"
					placeholder="Select a step type"
				/>
			</div>
		</div>
		{#if transformationStep.type === 'prompt_transform'}
			<Card.Description>
				{@html `
				<b>Variables:</b><br>
				- '{{input}}': refer to the original text<br>
				- '{{vocabulary}}': refer to the customized vocabulary`}
			</Card.Description>
		{/if}
		
		{#if transformationStep.type === 'find_replace'}
			<div class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<LabeledInput
						id="find_replace.findText"
						label="Find Text"
						value={transformationStep['find_replace.findText']}
						oninput={(e) => {
							setTransformationStepDebounced({
								...transformationStep,
								'find_replace.findText': e.currentTarget.value,
							});
						}}
						placeholder="Text or pattern to search for in the transcript"
					/>
					<LabeledInput
						id="find_replace.replaceText"
						label="Replace Text"
						value={transformationStep['find_replace.replaceText']}
						oninput={(e) => {		
							setTransformationStepDebounced({
								...transformationStep,
								'find_replace.replaceText': e.currentTarget.value,
							});
						}}
						placeholder="Text to use as the replacement"
					/>
				</div>
				<Accordion.Root type="single" class="w-full">
					<Accordion.Item class="border-none" value="advanced">
						<Accordion.Trigger class="text-sm">
							Advanced Options
						</Accordion.Trigger>
						<Accordion.Content>
							<LabeledSwitch
								id="find_replace.useRegex"
								label="Use Regex"
								checked={transformationStep['find_replace.useRegex']}
								onCheckedChange={(v) => {
									setTransformationStep({
										...transformationStep,
										'find_replace.useRegex': v,
									});
								}}
								description="Enable advanced pattern matching using regular expressions (for power users)"
							/>
						</Accordion.Content>
					</Accordion.Item>
				</Accordion.Root>
			</div>
		{:else if transformationStep.type === 'prompt_transform'}
			<div class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<LabeledSelect
						id="prompt_transform.inference.provider"
						label="Provider"
						items={INFERENCE_PROVIDER_OPTIONS}
						selected={transformationStep['prompt_transform.inference.provider']}
						placeholder="Select a provider"
						onSelectedChange={(value) => {
							setTransformationStep({
								...transformationStep,
								'prompt_transform.inference.provider': value,
							});
						}}
					/>

					{#if transformationStep['prompt_transform.inference.provider'] === 'OpenAI'}
						<LabeledSelect
							id="prompt_transform.inference.provider.OpenAI.model"
							label="Model"
							items={OPENAI_INFERENCE_MODEL_OPTIONS}
							selected={transformationStep[
								'prompt_transform.inference.provider.OpenAI.model'
							]}
							placeholder="Select a model"
							onSelectedChange={(value) => {
								setTransformationStep({
									...transformationStep,
									'prompt_transform.inference.provider.OpenAI.model': value,
								});
							}}
						/>
					{:else if transformationStep['prompt_transform.inference.provider'] === 'Groq'}
						<LabeledSelect
							id="prompt_transform.inference.provider.Groq.model"
							label="Model"
							items={GROQ_INFERENCE_MODEL_OPTIONS}
							selected={transformationStep[
								'prompt_transform.inference.provider.Groq.model'
							]}
							placeholder="Select a model"
							onSelectedChange={(value) => {
								setTransformationStep({
									...transformationStep,
									'prompt_transform.inference.provider.Groq.model': value,
								});
							}}
						/>
					{:else if transformationStep['prompt_transform.inference.provider'] === 'Anthropic'}
						<LabeledSelect
							id="prompt_transform.inference.provider.Anthropic.model"
							label="Model"
							items={ANTHROPIC_INFERENCE_MODEL_OPTIONS}
							selected={transformationStep[
								'prompt_transform.inference.provider.Anthropic.model'
							]}
							placeholder="Select a model"
							onSelectedChange={(value) => {
								setTransformationStep({
									...transformationStep,
									'prompt_transform.inference.provider.Anthropic.model': value,
								});
							}}
						/>
					{:else if transformationStep['prompt_transform.inference.provider'] === 'Google'}
						<LabeledSelect
							id="prompt_transform.inference.provider.Google.model"
							label="Model"
							items={GOOGLE_INFERENCE_MODEL_OPTIONS}
							selected={transformationStep[
								'prompt_transform.inference.provider.Google.model'
							]}
							placeholder="Select a model"
							onSelectedChange={(value) => {
								setTransformationStep({
									...transformationStep,
									'prompt_transform.inference.provider.Google.model': value,
								});
							}}
						/>
					{/if}
				</div>

				<LabeledTextarea
					id="prompt_transform.systemPromptTemplate"
					label="System Prompt Template"
					value={transformationStep['prompt_transform.systemPromptTemplate']}
					oninput={(e) => {
						setTransformationStepDebounced({
							...transformationStep,
							'prompt_transform.systemPromptTemplate': e.currentTarget.value,
						});
					}}
					placeholder="Define the AI's role and expertise, e.g., 'You are an expert at formatting meeting notes. Structure the text into clear sections with bullet points.'"
				/>
				<LabeledTextarea
					id="prompt_transform.userPromptTemplate"
					label="User Prompt Template"
					value={transformationStep['prompt_transform.userPromptTemplate']}
					oninput={(e) => {
						setTransformationStepDebounced({
							...transformationStep,
							'prompt_transform.userPromptTemplate': e.currentTarget.value,
						});
					}}
					placeholder="Tell the AI what to do with your text. Use {'{{input}}'} where you want your text to appear, e.g., 'Format this transcript into clear sections: {'{{input}}'}'"
				>
					{#snippet description()}
						{#if transformationStep['prompt_transform.userPromptTemplate'] && !transformationStep['prompt_transform.userPromptTemplate'].includes('{{input}}')}
							<p class="text-amber-500 text-sm font-semibold">
								Remember to include {'{{input}}'} in your prompt - this is where
								your text will be inserted!
							</p>
						{/if}
					{/snippet}
				</LabeledTextarea>
				<Accordion.Root type="single" class="w-full">
					<Accordion.Item class="border-none" value="advanced">
						<Accordion.Trigger class="text-sm">
							Advanced Options
						</Accordion.Trigger>
						<Accordion.Content>
							{#if transformationStep['prompt_transform.inference.provider'] === 'OpenAI'}
								<OpenAiApiKeyInput />
							{:else if transformationStep['prompt_transform.inference.provider'] === 'Groq'}
								<GroqApiKeyInput />
							{:else if transformationStep['prompt_transform.inference.provider'] === 'Anthropic'}
								<AnthropicApiKeyInput />
							{:else if transformationStep['prompt_transform.inference.provider'] === 'Google'}
								<GoogleApiKeyInput />
							{/if}
						</Accordion.Content>
					</Accordion.Item>
				</Accordion.Root>
			</div>
		{/if}
</div>
