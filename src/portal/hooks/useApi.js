// portal/hooks/useApi.js
// hook קל לשליפת נתונים (loading/error/data + refetch) ללא תלות חיצונית.
// ניתן להחליף בעתיד ב-TanStack Query בלי לשנות את הקומפוננטות.
import { useCallback, useEffect, useRef, useState } from "react";

const extractMessage = (err) => {
  const m = err?.response?.data?.message;
  if (typeof m === "string") return m;
  if (m?.he) return m.he;
  if (m?.en) return m.en;
  return "אירעה שגיאה בטעינת הנתונים";
};

export default function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcherRef.current();
      if (mounted.current) setData(res);
    } catch (err) {
      if (mounted.current) setError(extractMessage(err));
    } finally {
      if (mounted.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  return { data, loading, error, refetch: load };
}
