import Button from "../button/Button";

/**
 * Generic page-based pagination control.
 * `page` is 0-indexed (matches Spring's Pageable), displayed as 1-indexed.
 */
export default function Pagination({
    page,
    totalPages,
    totalElements,
    pageSize,
    onPageChange,
    disabled = false,
}) {
    if (totalPages <= 0) return null;

    const isFirst = page <= 0;
    const isLast = page >= totalPages - 1;

    const startItem = totalElements === 0 ? 0 : page * pageSize + 1;
    const endItem = Math.min((page + 1) * pageSize, totalElements);

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "1rem",
                flexWrap: "wrap",
                gap: "0.75rem",
            }}
        >
            <span style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
                {totalElements === 0
                    ? "No results"
                    : `Showing ${startItem}–${endItem} of ${totalElements}`}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Button
                    variant="white"
                    disabled={disabled || isFirst}
                    onClick={() => onPageChange(page - 1)}
                >
                    Previous
                </Button>
                <span style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
                    Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
                </span>
                <Button
                    variant="white"
                    disabled={disabled || isLast}
                    onClick={() => onPageChange(page + 1)}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}