import React from 'react';

/**
 * Generic table component.
 *
 * columns: [{ key, header, align?, render?(row) }]
 * data: array of row objects
 * keyField: field to use as the React key (defaults to 'id')
 */
export default function Table({ columns, data, keyField = 'id', emptyMessage = 'No records found.' }) {
  return (
    <div style={{ width: '100%', overflowX: 'auto', borderRadius: '1rem', border: '1px solid var(--border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--navy-light)' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: col.align || 'left',
                  padding: '0.9rem 1.1rem',
                  color: 'var(--white)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(!data || data.length === 0) ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row[keyField] ?? rowIndex}
                style={{
                  borderTop: '1px solid var(--border)',
                  background: rowIndex % 2 === 0 ? 'var(--white)' : '#F8FAFC',
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: '0.9rem 1.1rem',
                      textAlign: col.align || 'left',
                      color: 'var(--text)',
                      fontSize: '0.95rem',
                      verticalAlign: 'middle',
                    }}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
