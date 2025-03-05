<script lang="ts">
	import NavItems from '$lib/components/NavItems.svelte';
	import WhisperingButton from '$lib/components/WhisperingButton.svelte';
	import { getRecorderFromContext } from '$lib/query/singletons/recorder';
	import { settings } from '$lib/stores/settings.svelte';
	
	const recorder = getRecorderFromContext();
</script>

<svelte:head>
	<title>WhisperingX</title>
</svelte:head>

<main class="flex flex-1 flex-col items-center justify-center gap-4">
	<h1 class="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
		WhisperingX
	</h1>

	<NavItems class="xs:flex -mb-2.5 -mt-1 hidden" />

	<div class="xs:flex hidden flex-col items-center gap-4">
		<p class="text-muted-foreground text-center">
			<span>Click the </span>
			<WhisperingButton
				tooltipContent={recorder.recorderState === 'SESSION+RECORDING'
					? 'Stop recording'
					: 'Start recording'}
				onclick={() =>
					recorder.toggleRecording(
						recorder.recorderState !== 'SESSION+RECORDING',
					)}
				variant="ghost"
				class="flex-shrink-0 size-16 transform items-center justify-center overflow-hidden duration-300 ease-in-out"
			>
				<span
					style="filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.5)); view-transition-name: microphone-icon;"
					class="text-[50px] leading-none"
				>
					{#if recorder.recorderState === 'SESSION+RECORDING'}
						⏹️
					{:else}
						🎙️
					{/if}
				</span>
			</WhisperingButton>
			<span>button to toggle recording.</span>
		</p>
	</div>

	<div class="xs:flex hidden flex-col items-center gap-3">
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
