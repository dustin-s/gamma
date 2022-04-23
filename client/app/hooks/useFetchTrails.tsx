import { trailDataTypeGuard } from "../utils/typeGuard";
// https://stackoverflow.com/questions/70195659/how-do-i-use-my-custom-usefetch-hook-when-a-button-is-clicked
// https://stackoverflow.com/questions/69433942/how-to-fetch-data-from-a-custom-react-hook-api-with-onclick-and-display-it-in
import { useCallback, useState } from "react";
import { BASE_API } from "../utils/constants";
import { TrailData } from "../interfaces/TrailData";

interface FetchQuery {
  url?: string;
  options?: RequestInit;
}

interface State<T> {
  data?: T;
  error: Error | string | null;
  fetchData: any;
  loading: boolean;
}
export const useFetch = <TrailData,>(): State<TrailData[]> => {
  const [data, setData] = useState<TrailData[]>();
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (query: FetchQuery) => {
    const { url, options } = query;

    if (!url) return;

    setLoading(true);
    const response = await fetch(BASE_API + url, options);

    const data = await response.json();

    if (data.error) {
      setData(undefined);
      setError(data.error);
    } else {
      const trailData = trailDataTypeGuard(data);
      setData(trailData);
      setError(null);
    }
    setLoading(false);
  }, []);

  return { fetchData, data, error, loading };
};

export default useFetch;
