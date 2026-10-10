import { useCallback, useState } from "react";

type AsyncFn<T, A> = (arg: A) => Promise<T>;

export const useIpcMutation = <T, A = void>(fn: AsyncFn<T, A>) => {
	const [isFetching, setIsFetching] = useState<boolean>(false);
	const [error, setError] = useState<Error | null>(null);

	const mutate = useCallback(
		async (...args: A extends void ? [] : [A]) => {
      const arg = args[0] as A;

			setIsFetching(true);
			setError(null);

			try {
				return await fn(arg);
			} catch (e) {
				setError(e as Error);
				throw e;
			} finally {
				setIsFetching(false);
			}
		},
		[fn],
	);

	return { mutate, isFetching, error };
};
