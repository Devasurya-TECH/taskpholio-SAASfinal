import React from 'react'

const Spinner = React.memo(({ fullscreen = false, size = 20 }) => {
  if (fullscreen) {
    return (
      <div className="spinner-fullscreen">
        <div className="spinner" style={{ width: size, height: size }} />
      </div>
    )
  }
  return <div className="spinner" style={{ width: size, height: size }} />
})

export default Spinner
