<script lang="ts">
	import { goto } from '$app/navigation';
	import ConfirmationDialog from '$lib/components/ConfirmationDialog.svelte';
	import MoreDetailsDialog from '$lib/components/MoreDetailsDialog.svelte';
	import NotificationLog from '$lib/components/NotificationLog.svelte';
	import { getRecorderFromContext } from '$lib/query/singletons/recorder';
	import { ModeWatcher, mode } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { Toaster, type ToasterProps } from 'svelte-sonner';
	import { syncWindowAlwaysOnTopWithRecorderState } from './alwaysOnTop.svelte';
	import { closeToTrayIfEnabled } from './closeToTrayIfEnabled';

	const recorder = getRecorderFromContext();

	syncWindowAlwaysOnTopWithRecorderState();
	closeToTrayIfEnabled();

	$effect(() => {
		recorder.recorderState;
	});

	onMount(async () => {
		window.recorder = recorder;
		window.goto = goto;
	});

	const TOASTER_SETTINGS = {
		position: 'bottom-right',
		richColors: true,
		duration: 5000,
		visibleToasts: 5,
	} satisfies ToasterProps;

	let { children } = $props();
</script>

<button
	class="xxs:hidden hover:bg-accent hover:text-accent-foreground h-screen w-screen transform duration-300 ease-in-out"
	onclick={()=>recorder.toggleRecording(recorder.recorderState !== 'SESSION+RECORDING')}
>
	<span
		style="filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.5));"
		class="text-[48px] leading-none"
	>
		{#if recorder.recorderState === 'SESSION+RECORDING'}
			⏹️
		{:else}
			🎙️
		{/if}
	</span>
</button>

<div class="xxs:flex hidden min-h-screen flex-col items-center gap-2">
	{@render children()}
</div>

<Toaster
	offset={16}
	class="xs:block hidden"
	theme={$mode}
	{...TOASTER_SETTINGS}
/>
<ModeWatcher />
<ConfirmationDialog />
<MoreDetailsDialog />
