import { createResultMutation, playSoundIfEnabled } from '$lib/services';
import { RunTransformationService } from '$lib/services/index.js';
import { TransformErrorToWhisperingErr } from '$lib/services/runTransformation';
import { toast } from '$lib/services/toast';
import { type WhisperingResult } from '@repo/shared';
import { getContext, setContext } from 'svelte';
import { queryClient } from '..';
import type { TransformationStep } from '$lib/services/db';

export type Transformer = ReturnType<typeof createTransformer>;

export const initTransformerInContext = () => {
	const transformer = createTransformer();
	setContext('transformer', transformer);
	return transformer;
};

export const getTransformerFromContext = () => {
	return getContext<Transformer>('transformer');
};

const transformerKeys = {
	transformStep: ['transformer', 'transformStep'] as const,
};

export function createTransformer() {
	const transformStep = createResultMutation(() => ({
		mutationKey: transformerKeys.transformStep,
		onMutate: ({ toastId }) => {
			toast.loading({
				id: toastId,
				title: '🔄 Running transformation...',
				description: 'Applying your selected transformation to the input...',
			});
		},
		mutationFn: async ({
			input,
			transformationStep,
		}: {
			input: string;
			transformationStep: TransformationStep;
			toastId:string;
		}): Promise<WhisperingResult<string>> => {
			const transformationRunResult =
				await RunTransformationService.runTransformationStep({
					input,
					transformationStep,
				});

			if (!transformationRunResult.ok) {
				return TransformErrorToWhisperingErr(transformationRunResult);
			}

			return transformationRunResult;
		},
		onError: (error) => {
			toast.error(error);
		},
		onSuccess: (_output, { _toastId }) => {
			void playSoundIfEnabled('transformationComplete');
		},
		onSettled: (_data, _error) => {
		},
	}));
	return {
		get isCurrentlyTransforming() {
			return (
				queryClient.isMutating({
					mutationKey: transformerKeys.transformStep,
				}) > 0
			);
		},
		transformStep,
	};
}
