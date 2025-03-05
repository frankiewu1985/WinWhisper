import { createResultMutation } from '$lib/services';
import { RunTransformationService } from '$lib/services/index.js';
import { TransformErrorToWhisperingErr } from '$lib/services/runTransformation';
import { toast } from '$lib/services/toast';
import { type PostProcessingConfig, type WhisperingResult } from '@repo/shared';
import { getContext, setContext } from 'svelte';
import { queryClient } from '..';

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
	transform: ['transformer', 'transform'] as const,
};

export function createTransformer() {
	const transform = createResultMutation(() => ({
		mutationKey: transformerKeys.transform,
		onMutate: ({ toastId }) => {
			toast.loading({
				id: toastId,
				title: '🔄 Running transformation...',
				description: 'Applying your selected transformation to the input...',
			});
		},
		mutationFn: async ({
			input,
			config,
		}: {
			input: string;
			config: PostProcessingConfig;
			toastId:string;
		}): Promise<WhisperingResult<string>> => {
			const transformationRunResult =
				await RunTransformationService.runTransformation({
					input,
					config,
				});

			if (!transformationRunResult.ok) {
				return TransformErrorToWhisperingErr(transformationRunResult);
			}

			return transformationRunResult;
		},
		onError: (error) => {
			toast.error(error);
		},
	}));
	return {
		get isCurrentlyTransforming() {
			return (
				queryClient.isMutating({
					mutationKey: transformerKeys.transform,
				}) > 0
			);
		},
		transform,
	};
}
