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
	<NavItems class="xs:flex -mb-2.5 -mt-1 hidden" />

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
