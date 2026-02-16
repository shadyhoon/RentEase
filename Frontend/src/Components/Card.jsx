import React from 'react'

export default function Card({ title, children, onClick, style, onMouseEnter, onMouseLeave }) {
  return (
    <div
      className="card"
      onClick={onClick}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {title && <div className="card-title">{title}</div>}
      <div>{children}</div>
    </div>
  )
}
