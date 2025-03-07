<script lang="ts">
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { onMount } from 'svelte';
	import { getVersion } from '@tauri-apps/api/app';

	let version: string = '';

	onMount(async () => {
		version = await getVersion();
	});
</script>

<svelte:head>
	<title>Logs</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">About</h3>
		<Separator />
		<p class="text-muted-foreground text-sm mt-5">
			WhisperingX is a minimalist transcription tool forked from the open-source
			project <a
				class="text-blue-500 underline cursor-pointer"
				href="https://whispering.bradenwong.com">Whispering</a
			>.
		</p>
		<p class="text-muted-foreground text-sm mt-5">
			Built with a focus on accuracy and simplicity, WhisperingX strips away
			unnecessary features and code from its predecessor, offering a streamlined
			experience for users who need reliable audio-to-text conversion.
		</p>
		<p class="text-muted-foreground text-sm mt-5">Version: {version}</p>

		<p class="text-muted-foreground text-sm mt-5">
			Github: <a
				class="text-blue-500 underline cursor-pointer"
				href="https://github.com/movingfive/WhisperingX"
				>https://github.com/movingfive/WhisperingX</a
			>
		</p>
	</div>
	<Separator />
</div>
