<!-- filepath: /c:/git/WinWhisper/apps/app/src/lib/components/ui/recording-indicator/RecordingIndicator.svelte -->
<script>
  export let isRecording = false;
</script>

<style>
  .recording-indicator {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  .recording-indicator.show {
    opacity: 1;
  }
</style>

<div class:show={isRecording} class="recording-indicator">
  🎙️ Recording...
</div>