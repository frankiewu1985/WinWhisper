<script lang="ts">
	import { fasterRerecordExplainedDialog } from '$lib/components/FasterRerecordExplainedDialog.svelte';
	import NavItems from '$lib/components/NavItems.svelte';
	import RecordingControls from '$lib/components/RecordingControls.svelte';
	import WhisperingButton from '$lib/components/WhisperingButton.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import { useLatestRecording } from '$lib/query/recordings/queries';
	import { getRecorderFromContext } from '$lib/query/singletons/recorder';
	import { getVadRecorderFromContext } from '$lib/query/singletons/vadRecorder';
	import type { Recording } from '$lib/services/db';
	import { settings } from '$lib/stores/settings.svelte';
	import { createBlobUrlManager } from '$lib/utils/blobUrlManager';
	import { getRecordingTransitionId } from '$lib/utils/getRecordingTransitionId';
	import { AudioLinesIcon, MicIcon } from 'lucide-svelte';
	import { onDestroy } from 'svelte';

	const recorder = getRecorderFromContext();
	const vadRecorder = getVadRecorderFromContext();
	const { latestRecordingQuery } = useLatestRecording();

	const latestRecording = $derived<Recording>(
		latestRecordingQuery.data ?? {
			id: '',
			title: '',
			subtitle: '',
			createdAt: '',
			updatedAt: '',
			timestamp: '',
			blob: new Blob(),
			transcribedText: '',
			transcriptionStatus: 'UNPROCESSED',
		},
	);

	const blobUrlManager = createBlobUrlManager();

	const blobUrl = $derived.by(() => {
		if (!latestRecording.blob) return undefined;
		return blobUrlManager.createUrl(latestRecording.blob);
	});

	onDestroy(() => {
		blobUrlManager.revokeCurrentUrl();
	});

	let mode = $state<'manual' | 'voice-activated'>('manual');
</script>

<svelte:head>
	<title>Whispering</title>
</svelte:head>

<main class="flex flex-1 flex-col items-center justify-center gap-4">
	<div class="xs:flex hidden flex-col items-center gap-4">
		<h1 class="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
			WhisperingX
		</h1>
		<p class="text-muted-foreground text-center">
			Click the 🎙 button to start. Allow access to your microphone.
		</p>
	</div>

	<ToggleGroup.Root
		type="single"
		value={mode}
		class="max-w-xs w-full grid grid-cols-2 gap-2"
		onValueChange={(value) => {
			switch (value) {
				case 'voice-activated':
					mode = 'voice-activated';
					break;
				case 'manual':
					mode = 'manual';
					break;
			}
		}}
	>
		<ToggleGroup.Item value="manual" aria-label="Switch to manual mode">
			<MicIcon class="h-4 w-4" />
			Record
		</ToggleGroup.Item>
		<ToggleGroup.Item
			value="voice-activated"
			aria-label="Switch to voice activated mode"
		>
			<AudioLinesIcon class="h-4 w-4" />
			Voice Activated
		</ToggleGroup.Item>
	</ToggleGroup.Root>

	<div class="max-w-md flex items-end justify-between w-full gap-2 pt-1">
		<div class="flex-1"></div>
		{#if mode === 'manual'}
			<WhisperingButton
				tooltipContent={recorder.recorderState === 'SESSION+RECORDING'
					? 'Stop recording'
					: 'Start recording'}
				onclick={()=>recorder.toggleRecording(recorder.recorderState !== 'SESSION+RECORDING')}
				variant="ghost"
				class="flex-shrink-0 size-32 transform items-center justify-center overflow-hidden duration-300 ease-in-out"
			>
				<span
					style="filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.5)); view-transition-name: microphone-icon;"
					class="text-[100px] leading-none"
				>
					{#if recorder.recorderState === 'SESSION+RECORDING'}
						⏹️
					{:else}
						🎙️
					{/if}
				</span>
			</WhisperingButton>
		{:else}
			<WhisperingButton
				tooltipContent={vadRecorder.vadState === 'SESSION+RECORDING'
					? 'Stop voice activated session'
					: 'Start voice activated session'}
				onclick={vadRecorder.toggleVad}
				variant="ghost"
				class="flex-shrink-0 size-32 transform items-center justify-center overflow-hidden duration-300 ease-in-out"
			>
				<span
					style="filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.5)); view-transition-name: microphone-icon;"
					class="text-[100px] leading-none"
				>
					{#if vadRecorder.vadState === 'SESSION+RECORDING'}
						🛑
					{:else}
						🎬
					{/if}
				</span>
			</WhisperingButton>
		{/if}
		<div class="flex-1 flex-justify-center mb-2">
			{#if recorder.recorderState === 'SESSION+RECORDING'}
				<WhisperingButton
					tooltipContent="Cancel recording"
					onclick={() => recorder.cancelRecorderWithToast()}
					variant="ghost"
					size="icon"
					style="view-transition-name: cancel-icon;"
				>
					🚫
				</WhisperingButton>
			{:else if recorder.recorderState === 'SESSION'}
				<WhisperingButton
					onclick={() => {
						recorder.closeRecordingSessionWithToast();
					}}
					variant="ghost"
					size="icon"
					style="view-transition-name: end-session-icon;"
				>
					🔴
					{#snippet tooltipContent()}
						End recording session
						<Button
							variant="link"
							size="inline"
							onclick={() => fasterRerecordExplainedDialog.open()}
						>
							(What's that?)
						</Button>
					{/snippet}
				</WhisperingButton>
			{:else if vadRecorder.vadState === 'SESSION+RECORDING' || vadRecorder.vadState === 'SESSION'}
				<!-- Render nothing -->
			{:else}
				<RecordingControls></RecordingControls>
			{/if}
		</div>
	</div>

	<div class="xxs:flex hidden w-full max-w-xs flex-col items-center gap-2">
		{#if blobUrl}
			<audio
				style="view-transition-name: {getRecordingTransitionId({
					recordingId: latestRecording.id,
					propertyName: 'blob',
				})}"
				src={blobUrl}
				controls
				class="h-8 w-full"
			></audio>
		{/if}
	</div>

	<NavItems class="xs:flex -mb-2.5 -mt-1 hidden" />

	<div class="xs:flex hidden flex-col items-center gap-3">
		<p class="text-foreground/75 text-center text-sm">
			Click the microphone or press
			{' '}<WhisperingButton
				tooltipContent="Go to local shortcut in settings"
				href="/settings#local-shortcut"
				variant="link"
				size="inline"
			>
				<kbd
					class="bg-muted relative rounded px-[0.3rem] py-[0.15rem] font-mono text-sm font-semibold"
				>
					{settings.value['shortcuts.currentLocalShortcut']}
				</kbd>
			</WhisperingButton>{' '}
			to start recording here.
		</p>
		<p class="text-foreground/75 text-sm">
			Press
			{' '}<WhisperingButton
				tooltipContent="Go to global shortcut in settings"
				href="/settings#global-shortcut"
				variant="link"
				size="inline"
			>
				<kbd
					class="bg-muted relative rounded px-[0.3rem] py-[0.15rem] font-mono text-sm font-semibold"
				>
					{settings.value['shortcuts.currentGlobalShortcut']}
				</kbd>
			</WhisperingButton>{' '}
			to start recording anywhere.
		</p>
	</div>
</main>
