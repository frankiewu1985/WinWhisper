<script module lang="ts">
	const notificationLog = (() => {
		let isOpen = $state(false);
		let logs = $state<ToastAndNotifyOptions[]>([]);
		return {
			get isOpen() {
				return isOpen;
			},
			set isOpen(value: boolean) {
				isOpen = value;
			},
			get logs() {
				return logs;
			},
			addLog: (log: ToastAndNotifyOptions) => {
				logs.push(log);
			},
			clearLogs: () => {
				logs = [];
			},
		};
	})();

	export { notificationLog };
</script>

<script lang="ts">
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import type { ToastAndNotifyOptions } from '@repo/shared';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import {
		AlertCircle,
		AlertTriangle,
		CheckCircle2,
		Info,
		Loader,
		LogsIcon,
	} from 'lucide-svelte';
	import { mode } from 'mode-watcher';
	import WhisperingButton from './WhisperingButton.svelte';
	import { cn } from '$lib/utils.js';
</script>

<WhisperingButton
	tooltipContent="Clear Logs"
	class="mt-4"
	variant="outline"
	size="sm"
	onclick={() => notificationLog.clearLogs()}
>
	Clear Logs
</WhisperingButton>

<ScrollArea
	class="mt-4 h-[60vh] overflow-y-auto rounded-md border bg-background p-4"
	data-sonner-toaster
	data-theme={$mode}
	data-rich-colors="true"
>
	{#each notificationLog.logs as log}
		<Alert.Root
			class="mb-2 last:mb-0"
			data-sonner-toast
			data-type={log.variant}
			data-styled="true"
			data-mounted="true"
		>
			<div class="flex items-center gap-3">
				{#if log.variant === 'error'}
					<div data-icon class="text-destructive">
						<AlertCircle class="h-4 w-4" />
					</div>
				{:else if log.variant === 'warning'}
					<div data-icon class="text-warning">
						<AlertTriangle class="h-4 w-4" />
					</div>
				{:else if log.variant === 'success'}
					<div data-icon class="text-success">
						<CheckCircle2 class="h-4 w-4" />
					</div>
				{:else if log.variant === 'info'}
					<div data-icon class="text-info"><Info class="h-4 w-4" /></div>
				{:else if log.variant === 'loading'}
					<div data-icon class="text-muted-foreground">
						<Loader class="h-4 w-4 animate-spin" />
					</div>
				{/if}
				<div class="flex-1">
					<Alert.Title class="text-sm font-medium leading-none tracking-tight">
						{log.title}
					</Alert.Title>
					<Alert.Description class="mt-1 text-sm text-muted-foreground">
						{log.description}
					</Alert.Description>
				</div>
			</div>
		</Alert.Root>
	{/each}

	{#if notificationLog.logs.length === 0}
		<div
			class="flex h-32 items-center justify-center text-sm text-muted-foreground"
		>
			No logs to display
		</div>
	{/if}
</ScrollArea>
