<script lang="ts">
	import { fasterRerecordExplainedDialog } from '$lib/components/FasterRerecordExplainedDialog.svelte';
	import { macOSAppNapExplainedDialog } from '$lib/components/MacOSAppNapExplainedDialog.svelte';
	import MacOSAppNapExplainedDialog from '$lib/components/MacOSAppNapExplainedDialog.svelte';
	import {
		LabeledSelect,
		LabeledSwitch,
	} from '$lib/components/labeled/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { settings } from '$lib/stores/settings.svelte';
	import { ALWAYS_ON_TOP_OPTIONS } from '@repo/shared';
	import { type } from '@tauri-apps/plugin-os';
</script>

<svelte:head>
	<title>Settings - Whispering</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">General</h3>
		<p class="text-muted-foreground text-sm">
			Configure your general Whispering preferences.
		</p>
	</div>

	<Separator />

	<LabeledSwitch
		id="transcription.copyToClipboardOnSuccess"
		label="Copy text to clipboard on successful transcription"
		checked={settings.value['transcription.copyToClipboardOnSuccess']}
		onCheckedChange={(v) => {
			settings.value = {
				...settings.value,
				'transcription.copyToClipboardOnSuccess': v,
			};
		}}
	/>

	<LabeledSwitch
		id="transcription.insertToCursorOnSuccess"
		label="Paste contents from clipboard after successful transcription"
		checked={settings.value['transcription.insertToCursorOnSuccess']}
		onCheckedChange={(v) => {
			settings.value = {
				...settings.value,
				'transcription.insertToCursorOnSuccess': v,
			};
		}}
	/>

	<Separator />

	<LabeledSwitch
		id="faster-rerecord"
		checked={settings.value['recording.isFasterRerecordEnabled']}
		onCheckedChange={(v) => {
			settings.value = {
				...settings.value,
				'recording.isFasterRerecordEnabled': v,
			};
		}}
	>
		{#snippet label()}
			Enable faster rerecord. <Button
				variant="link"
				size="inline"
				onclick={() => fasterRerecordExplainedDialog.open()}
			>
				(What's that?)
			</Button>
		{/snippet}
	</LabeledSwitch>

	<LabeledSwitch
		id="close-to-tray"
		checked={settings.value['system.closeToTray']}
		onCheckedChange={(v) => {
			settings.value = { ...settings.value, 'system.closeToTray': v };
		}}
	>
		{#snippet label()}
			Close to tray instead of quitting.
			{#if type() === 'macos'}
				<Button
					variant="link"
					size="inline"
					onclick={() => macOSAppNapExplainedDialog.open()}
				>
					(Not recommended for macOS)
				</Button>
			{/if}
		{/snippet}
	</LabeledSwitch>

	<Separator />

	<LabeledSelect
		id="always-on-top"
		label="Always On Top"
		items={ALWAYS_ON_TOP_OPTIONS}
		selected={settings.value['system.alwaysOnTop']}
		onSelectedChange={async (selected) => {
			settings.value = {
				...settings.value,
				'system.alwaysOnTop': selected,
			};
		}}
		placeholder="Select a language"
	/>
</div>

<MacOSAppNapExplainedDialog />
