import React from 'react'

export default function Card({title, children}){
  return (
    <div className="card">
      {title && <div className="card-title">{title}</div>}
      <div>{children}</div>
    </div>
  )
}
