import { LogicalSize, LogicalPosition } from "@tauri-apps/api/dpi";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

let recorderIndicatorWindow: WebviewWindow | null = null;

export const showRecorderIndicator = () => {
	if (!recorderIndicatorWindow) {
		try {
			// Get the screen size
			const screenSize = window.screen;
			const screenWidth = screenSize.width;
			const screenHeight = screenSize.height;

			// Calculate the position for the bottom center
			const windowWidth = 120;
			const windowHeight = 60;
			const x = (screenWidth - windowWidth) / 2;
			const y = screenHeight - windowHeight - 150;

			// Open a new Tauri window in hidden mode
			recorderIndicatorWindow = new WebviewWindow('recording', {
				url: 'recording.html',
				resizable: false,
				decorations: false,
				transparent: true,
				alwaysOnTop: true,
				visible: false,
				shadow: false,
				skipTaskbar: true,
				focus: false,
			});

			// Set the position of the window
			recorderIndicatorWindow.setSize(
				new LogicalSize(windowWidth, windowHeight),
			);
			recorderIndicatorWindow.setPosition(new LogicalPosition(x, y));

			recorderIndicatorWindow.once('tauri://created', () => {
				console.log('Recorder indicator window created successfully');
			});

			recorderIndicatorWindow.once('tauri://error', (e) => {
				console.error('Failed to create recorder indicator window', e);
			});
		} catch (error) {
			console.error('Error creating recorder indicator window:', error);
		}
	}

	recorderIndicatorWindow!
		.show()
		.then(() => {			
			// Get the screen size
			const screenSize = window.screen;
			const screenWidth = screenSize.width;
			const screenHeight = screenSize.height;

			// Calculate the position for the bottom center
			const windowWidth = 120;
			const windowHeight = 60;
			const x = (screenWidth - windowWidth) / 2;
			const y = screenHeight - windowHeight - 150;

			recorderIndicatorWindow?.setPosition(new LogicalPosition(x, y));

			console.log('Recorder indicator window shown successfully');
		})
		.catch((error) => {
			console.error('Error showing recorder indicator window:', error);
		});
};

export const hideRecorderIndicator = () => {
	if (recorderIndicatorWindow) {
		recorderIndicatorWindow
			.hide()
			.then(() => {
				console.log('Recorder indicator window hidden successfully');
			})
			.catch((error) => {
				console.error('Error hiding recorder indicator window:', error);
			});
	} else {
		console.log('No recorder indicator window to hide');
	}
};
