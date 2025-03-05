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
	<title>Configure Shortcuts - Whispering</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Shortcuts</h3>
		<p class="text-muted-foreground text-sm">
			Configure your shortcuts for activating Whispering.
		</p>
	</div>
	<Separator />

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

	<div>
		<LabeledSelect
			id="output-language1"
			label="Output Language #1"
			items={SUPPORTED_LANGUAGES_OPTIONS}
			selected={settings.value['transcription.outputLanguage1']}
			onSelectedChange={(selected) => {
				settings.value = {
					...settings.value,
					'transcription.outputLanguage1': selected,
				};
			}}
			placeholder="Select a language"
		/>	
		<LabeledInput
			id="global-shortcut-language1"
			label="Shortcut (language #1)"
			placeholder="Shortcut to toggle recording for language #1"
			value={settings.value['shortcuts.currentGlobalShortcut1']}
			onchange={({ currentTarget: { value } }) => {
				settings.value = {
					...settings.value,
					'shortcuts.currentGlobalShortcut1': value,
				};
				registerShortcuts.registerGlobalShortcut({
					shortcut: value,
					callback: (action) => recorder.toggleRecording(action=== 'Pressed', settings.value['transcription.outputLanguage1']),
				});
			}}
		/>	
	</div>

	<Separator />

	<div>
		<LabeledSelect
			id="output-language2"
			label="Output Language #2"
			items={SUPPORTED_LANGUAGES_OPTIONS}
			selected={settings.value['transcription.outputLanguage2']}
			onSelectedChange={(selected) => {
				settings.value = {
					...settings.value,
					'transcription.outputLanguage2': selected,
				};
			}}
			placeholder="Select a language"
		/>
		<LabeledInput
			id="global-shortcut-language2"
			label="Shortcut (language #2)"
			placeholder="Shortcut to toggle recording for language #1"
			value={settings.value['shortcuts.currentGlobalShortcut2']}
			onchange={({ currentTarget: { value } }) => {
				settings.value = {
					...settings.value,
					'shortcuts.currentGlobalShortcut2': value,
				};
				registerShortcuts.registerGlobalShortcut({
					shortcut: value,
					callback: (action) => recorder.toggleRecording(action=== 'Pressed', settings.value['transcription.outputLanguage2']),
				});
			}}
		/>	
	</div>
	
	<Separator />
	<div>
		<LabeledSelect
			id="output-language3"
			label="Output Language #3"
			items={SUPPORTED_LANGUAGES_OPTIONS}
			selected={settings.value['transcription.outputLanguage3']}
			onSelectedChange={(selected) => {
				settings.value = {
					...settings.value,
					'transcription.outputLanguage3': selected,
				};
			}}
			placeholder="Select a language"
		/>
		<LabeledInput
			id="global-shortcut-language3"
			label="Shortcut (language #3)"
			placeholder="Shortcut to toggle recording for language #3"
			value={settings.value['shortcuts.currentGlobalShortcut3']}
			onchange={({ currentTarget: { value } }) => {
				settings.value = {
					...settings.value,
					'shortcuts.currentGlobalShortcut3': value,
				};
				registerShortcuts.registerGlobalShortcut({
					shortcut: value,
					callback: (action) => recorder.toggleRecording(action=== 'Pressed', settings.value['transcription.outputLanguage3']),
				});
			}}
		/>	
	</div>
</div>
