<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	</script>

<svelte:head>
	<title>Change Global Keyboard Shortcut</title>
</svelte:head>

<main class="flex flex-1 items-center justify-center">
	<section class="container flex flex-col items-center gap-4 text-center">
		<h1 class="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
			Change Your Global Keyboard Shortcut
		</h1>
		<p class="text-muted-foreground lg:text-xl">
			You can access global keyboard shortcuts on the extension and desktop app.
		</p>
		<Button onclick={() => window.history.back()} variant="link">Go back</Button
		>
	</section>
</main>
