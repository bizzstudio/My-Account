// src/hooks/useAsync.js
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { SidebarContext } from "@/context/SidebarContext";

const useAsync = (asyncFunction) => {
  const [data, setData] = useState([] || {});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const {
    limitData,
    method,
    isUpdate,
    setIsUpdate,
    currentPage,
    searchText,
    sortedField,
    lang,
  } = useContext(SidebarContext);

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();
    let debounceTimeout;

    const fetchData = async () => {
      try {
        const res = await asyncFunction({ cancelToken: source.token });
        if (!unmounted) {
          setData(res);
          setError("");
          setLoading(false);
        }
      } catch (err) {
        if (!unmounted) {
          const message = err?.data?.message || err?.response?.data?.message || err?.message;
          setError(message?.[lang] || message);
          if (axios.isCancel(err)) {
            setError(message?.[lang] || message);
            setLoading(false);
            setData([]);
          } else {
            setError(message?.[lang] || message);
            setLoading(false);
            setData([]);
          }
        }
      }
    };

    debounceTimeout = setTimeout(fetchData, 1000);

    setIsUpdate(false);

    return () => {
      unmounted = true;
      source.cancel("Cancelled in cleanup");
      clearTimeout(debounceTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    method,
    limitData,
    isUpdate,
    currentPage,
    searchText,
    sortedField,
  ]);

  return {
    data,
    error,
    loading,
  };
};

export default useAsync;
