<script lang="ts">
    import { onNavigate } from '$app/navigation';
    import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
    import '../app.css';
    import { queryClient } from '$lib/query';
    import { QueryClientProvider } from '@tanstack/svelte-query';
    import AppShell from './+layout/AppShell.svelte';
    import GlobalSingletonsContext from './+layout/GlobalSingletonsContext.svelte';
    import { getRecorderFromContext } from '$lib/query/singletons/recorder';
    import { derived, writable } from 'svelte/store';
    import { onMount, onDestroy } from 'svelte';

    let { children } = $props();

    const recorder = writable(null);
    const isRecording = derived(recorder, $recorder => $recorder?.recorderState === 'SESSION+RECORDING');

    let recordingWindow: Window | null = null;

    onMount(() => {
        const recorderInstance = getRecorderFromContext();
        recorder.set(recorderInstance);

        // Watch for changes in the recording state and open/close the pop-up window
        const unsubscribe = isRecording.subscribe($isRecording => {
            if ($isRecording) {
                // Open a new pop-up window
                recordingWindow = window.open('', 'Recording', 'width=300,height=100');
                if (recordingWindow) {
                    recordingWindow.document.write('<h1>🎙️ Recording...</h1>');
                    recordingWindow.document.body.style.backgroundColor = 'black';
                    recordingWindow.document.body.style.color = 'white';
                    recordingWindow.document.body.style.display = 'flex';
                    recordingWindow.document.body.style.justifyContent = 'center';
                    recordingWindow.document.body.style.alignItems = 'center';
                    recordingWindow.document.body.style.height = '100vh';
                    recordingWindow.document.body.style.margin = '0';
                }
            } else if (recordingWindow) {
                // Close the pop-up window
                recordingWindow.close();
                recordingWindow = null;
            }
        });

        onDestroy(() => {
            unsubscribe();
            if (recordingWindow) {
                recordingWindow.close();
            }
        });
    });

    onNavigate((navigation) => {
        if (!document.startViewTransition) return;

        return new Promise((resolve) => {
            document.startViewTransition(async () => {
                resolve();
                await navigation.complete;
            });
        });
    });
</script>

<svelte:head>
    <title>Whispering</title>
</svelte:head>

<QueryClientProvider client={queryClient}>
    <GlobalSingletonsContext>
        <AppShell>
            {@render children()}
        </AppShell>
    </GlobalSingletonsContext>
    <SvelteQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
</QueryClientProvider>