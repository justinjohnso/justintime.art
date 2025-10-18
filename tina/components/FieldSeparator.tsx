import React from 'react'
import type { TinaField } from 'tinacms'

interface FieldSeparatorProps {
  field: TinaField
}

export const FieldSeparator = ({ field }: FieldSeparatorProps) => {
  // Use the field's label as the separator text
  const label = field.label || 'Section'

  return (
    <div
      style={{
        margin: '2rem 0 1.5rem 0',
        paddingTop: '1rem',
        borderTop: '2px solid #e5e7eb',
      }}
    >
      <div
        style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#6b7280',
          textAlign: 'left',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
    </div>
  )
}
