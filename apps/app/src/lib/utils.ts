import { PhysicalSize, LogicalPosition, type Window as TaruiWindow, PhysicalPosition, LogicalSize } from '@tauri-apps/api/window';
import { type ClassValue, clsx } from 'clsx';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 },
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;

	const scaleConversion = (
		valueA: number,
		scaleA: [number, number],
		scaleB: [number, number],
	) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (
		style: Record<string, number | string | undefined>,
	): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return `${str}${key}:${style[key]};`;
		}, '');
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t,
			});
		},
		easing: cubicOut,
	};
};

export function getExtensionFromAudioBlob(blob: Blob) {
	const mimeType = blob.type.toLowerCase();
	const mimeIncludes = (...types: string[]) =>
		types.some((type) => mimeType.includes(type));
	if (mimeIncludes('webm')) return 'webm';
	if (mimeIncludes('mp4', 'mpeg', 'mp4a')) return 'mp4';
	if (mimeIncludes('ogg', 'opus')) return 'ogg';
	if (mimeIncludes('wav', 'wave')) return 'wav';
	if (mimeIncludes('aac')) return 'aac';
	if (mimeIncludes('flac')) return 'flac';
	return 'mp3';
}

export function getErrorMessage(error: unknown) {
	if (error instanceof Error) return error.message;
	if (typeof error === 'string') return error;
	const message = (error as { message?: unknown })?.message;
	if (typeof message === 'string') return message;
	const e = (error as { error?: unknown })?.error;
	if (e) return getErrorMessage(e);
	return JSON.stringify(error);
}


// Animate window size with position adjustment
export async function setWindowSizeWithAnimation(appWindow: TaruiWindow, targetLogicalWidth: number, targetLogicalHeight: number, duration: number = 100) {
	// Get current window state
	const scaleFactor = await appWindow.scaleFactor();
	
	const currentPhysicalSize = await appWindow.innerSize();
	const startLogicalWidth = currentPhysicalSize.width / scaleFactor;
	const startLogicalHeight = currentPhysicalSize.height / scaleFactor;

	const currentPhysicalPos = await appWindow.outerPosition(); // Top-left corner
	const startX = currentPhysicalPos.x / scaleFactor;
	const startY = currentPhysicalPos.y / scaleFactor;
	
	// Calculate initial center point
	const centerX = startX + startLogicalWidth / 2;
	const centerY = startY + startLogicalHeight / 2;

	const startTime = performance.now();

	// Linear interpolation
	const lerp = (start:number, end:number, t:number) => {
		return start + (end - start) * t;
	};

	// Ease-out cubic for snappy feel
	const easeOutCubic = (t:number) => {
		return 1 - Math.pow(1 - t, 3);
	};

	const step = (currentTime: number) => {
		const elapsed = currentTime - startTime;
		let progress = elapsed / duration;

		if (progress >= 1) {
			progress = 1; // Lock to target
			
			// Final size and position to maintain center
			const finalWidth = targetLogicalWidth;
			const finalHeight = targetLogicalHeight;
			const finalX = centerX - finalWidth / 2;
			const finalY = centerY - startLogicalHeight / 2;

			appWindow.setSize(new LogicalSize(finalWidth, finalHeight));
      		appWindow.setPosition(new LogicalPosition(finalX, finalY));
		} else {
			// Animate with easing
			const easedProgress = easeOutCubic(progress);
			const newWidth = Math.round(lerp(startLogicalWidth, targetLogicalWidth, easedProgress));
			const newHeight = Math.round(lerp(startLogicalHeight, targetLogicalHeight, easedProgress));

			let newX = centerX - newWidth / 2;
			let newY = centerY - startLogicalHeight / 2;

			// Apply size and position
			appWindow.setSize(new LogicalSize(newWidth, newHeight)).catch(err => console.error(err));
			appWindow.setPosition(new LogicalPosition(newX, newY)).catch(err => console.error(err));

			requestAnimationFrame(step);
		}
	};

	requestAnimationFrame(step);
}