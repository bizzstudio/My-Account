// src/hooks/useAsync2.js
import { SidebarContext } from "@/context/SidebarContext";
import axios from "axios";
import { useContext, useEffect, useState } from "react";

const useAsync2 = (asyncFunction, triggerDeps = []) => {
  const [data, setData] = useState(null);     // אפשר גם [] לפי השימוש
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);   // ⬅︎ רק עבור FIRST fetch
  const [fetching, setFetching] = useState(false);  // ⬅︎ לרענונים     

  const { lang, isUpdate, setIsUpdate } = useContext(SidebarContext);

  useEffect(() => {
    let cancelled = false;
    let source = axios.CancelToken.source();

    const fetchData = async () => {
      // אם אין נתונים בכלל → טעינה ראשונית, אחרת → רענון
      if (data === null) {
        setLoading(true);      // Skeleton
      } else {
        setFetching(true);     // אינדיקטור קטן/שקט
      };

      setError(null);
      try {
        const result = await asyncFunction({ cancelToken: source.token });
        if (!cancelled) {
          setData(result);
          setError("");
          setLoading(false);
        }
      } catch (err) {
        console.log("err", err);
        if (!cancelled) {
          const message = err?.data?.message || err?.response?.data?.message || err?.message;
          setError(message?.[lang] || message);
          setData(null);
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
      } finally {
        if (!cancelled) {
          setIsUpdate(false);
          setLoading(false);   // מסתיים תמיד
          setFetching(false);  // מסתיים תמיד
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
      source.cancel("Cancelled in cleanup");
    };
  }, [...triggerDeps, isUpdate]); // ⬅ רק כשיש שינוי במשהו ב־triggerDeps, הקריאה תתבצע

  return { data, error, loading, fetching };
};

export default useAsync2;