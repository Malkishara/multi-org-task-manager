import { useEffect, useRef, useState } from "react";

/**
 * Debounced text input for server-side search. Calls onSearch(value) only
 * after the user stops typing for `debounceMs`, or immediately on Enter.
 */
export default function SearchField({
    onSearch,
    placeholder = "Search…",
    debounceMs = 400,
    initialValue = "",
    disabled = false,
}) {
    const [value, setValue] = useState(initialValue);
    const timeoutRef = useRef(null);

    useEffect(() => {
        return () => clearTimeout(timeoutRef.current);
    }, []);

    const handleChange = (e) => {
        const next = e.target.value;
        setValue(next);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => onSearch(next), debounceMs);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            clearTimeout(timeoutRef.current);
            onSearch(value);
        }
    };

    return (
        <input
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--border, #E5E7EB)",
                fontSize: "0.875rem",
                minWidth: "220px",
                width: "100%",
                boxSizing: "border-box",
                outline: "none",
                height:"48px"
            }}
        />
    );
}