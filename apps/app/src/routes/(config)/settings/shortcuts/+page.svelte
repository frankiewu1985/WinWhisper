<script lang="ts">
	import { LabeledInput, LabeledSelect } from '$lib/components/labeled/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { getRecorderFromContext } from '$lib/query/singletons/recorder';
	import {
		getRegisterShortcutsFromContext,
		settings,
	} from '$lib/stores/settings.svelte';
	import { SUPPORTED_LANGUAGES_OPTIONS } from '@repo/shared';

	const recorder = getRecorderFromContext();
	const registerShortcuts = getRegisterShortcutsFromContext();
</script>

<svelte:head>
	<title>Configure Shortcuts</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Shortcuts</h3>
		<p class="text-muted-foreground text-sm">
			Configure your shortcuts for activating WhisperingX.
		</p>
	</div>
	<Separator />

	<LabeledSelect
	id="output-language"
	label="Output Language"
	items={SUPPORTED_LANGUAGES_OPTIONS}
	selected={settings.value['transcription.outputLanguage']}
	onSelectedChange={(selected) => {
		settings.value = {
			...settings.value,
			'transcription.outputLanguage': selected,
		};
	}}
	placeholder="Select a language"
/>	
	<LabeledInput
		id="global-shortcut"
		label="Global Shortcut (language Auto)"
		placeholder="Global Shortcut to toggle recording"
		value={settings.value['shortcuts.currentGlobalShortcut']}
		onchange={({ currentTarget: { value } }) => {
			settings.value = {
				...settings.value,
				'shortcuts.currentGlobalShortcut': value,
			};
			registerShortcuts.registerGlobalShortcut({
				shortcut: value,
				callback: (action) => recorder.toggleRecording(action=== 'Pressed'),
			});
		}}
	/>	
	
	<Separator />
</div>
