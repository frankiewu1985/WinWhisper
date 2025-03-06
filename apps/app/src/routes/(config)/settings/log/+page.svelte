<script lang="ts">
	import { Separator } from '$lib/components/ui/separator/index.js';
	import NotificationLog from '$lib/components/NotificationLog.svelte';
</script>

<svelte:head>
	<title>Logs</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Logs</h3>
		<p class="text-muted-foreground text-sm">
			Check the activity logs
		</p>
	</div>
	<Separator />

	<NotificationLog />
</div>
