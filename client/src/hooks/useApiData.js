/**
 * useApiData.js
 * -------------
 * A reusable React hook for loading data from the API.
 * It keeps track of three things for you: the data, whether it is still
 * loading, and any error message.
 *
 * Example:
 *     const { data, isLoading, errorMessage, reload } =
 *         useApiData(() => publicApi.getProperties({ featured: true }), []);
 *
 * @param {Function} fetchFunction - returns a Promise with the data
 * @param {Array} dependencies     - reload whenever one of these values changes
 */

import { useCallback, useEffect, useRef, useState } from "react";

export function useApiData(fetchFunction, dependencies = []) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Counts requests so that a slow, older request never overwrites newer data
  const latestRequestNumber = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadData = useCallback(fetchFunction, dependencies);

  const reload = useCallback(async () => {
    latestRequestNumber.current += 1;
    const thisRequestNumber = latestRequestNumber.current;

    setIsLoading(true);
    setErrorMessage("");
    try {
      const responseData = await loadData();
      if (thisRequestNumber === latestRequestNumber.current) {
        setData(responseData);
      }
    } catch (error) {
      if (thisRequestNumber === latestRequestNumber.current) {
        setErrorMessage(error.message);
      }
    } finally {
      if (thisRequestNumber === latestRequestNumber.current) {
        setIsLoading(false);
      }
    }
  }, [loadData]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, setData, isLoading, errorMessage, reload };
}
