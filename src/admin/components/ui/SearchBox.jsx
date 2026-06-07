// admin/components/ui/SearchBox.jsx
// תיבת חיפוש עם חיפוש "חי" (תוך כדי הקלדה, עם השהייה קצרה), אייקון זכוכית מגדלת
// במבנה flex (לא absolute — כך שהאייקון לעולם לא חופף לטקסט) וכפתור איפוס.
import { useEffect, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

export default function SearchBox({ placeholder, onSearch, delay = 300 }) {
  const [value, setValue] = useState("");

  // חיפוש חי: מעדכן את החיפוש מעט אחרי שהמשתמש מפסיק להקליד (גם אות אחת מספיקה)
  useEffect(() => {
    const t = setTimeout(() => onSearch(value.trim()), delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200">
      <FiSearch className="shrink-0 text-gray-400" aria-hidden />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent py-2.5 text-sm outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="איפוס חיפוש"
          title="איפוס"
          className="shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <FiX />
        </button>
      )}
    </div>
  );
}
