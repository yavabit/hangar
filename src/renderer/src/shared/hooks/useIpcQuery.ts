import { useCallback, useEffect, useState } from "react";

type AsyncFn<T> = () => Promise<T>;

type UseIpcQueryResult<T> = {
	data: T | null;
	loading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
};

export const useIpcQuery = <T>(fn: AsyncFn<T>): UseIpcQueryResult<T> => {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);

	const refetch = useCallback(async (): Promise<void> => {
		setLoading(true);
		setError(null);

		try {
			const res = await fn();
			setData(res);
		} catch (e) {
			setError(e as Error);
		} finally {
			setLoading(false);
		}
	}, [fn]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		void refetch();
	}, []);

	return { data, loading, error, refetch };
};
