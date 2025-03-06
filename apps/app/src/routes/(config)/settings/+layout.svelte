<script lang="ts">
	import SidebarNav from './SidebarNav.svelte';

	let { children } = $props();

	const sidebarNavItems = [
		{ title: 'General', href: '/settings' },
		{ title: 'Recording', href: '/settings/recording' },
		{ title: 'Transcription', href: '/settings/transcription' },
		{ title: 'Post Processing', href: '/settings/post-processing' },
		{ title: 'API Keys', href: '/settings/api-keys' },
		{ title: 'Shortcuts', href: '/settings/shortcuts' },
	] as const;

	const isString = (value: unknown): value is string =>
		typeof value === 'string';
</script>

<main class="container flex w-full flex-1 flex-col pb-4 pt-2">
	<div class="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
		<aside class="-mx-4 lg:w-1/5">
			<SidebarNav items={sidebarNavItems} />
		</aside>
		<div class="flex-1 lg:max-w-2xl">
			{@render children()}
		</div>
	</div>
</main>
