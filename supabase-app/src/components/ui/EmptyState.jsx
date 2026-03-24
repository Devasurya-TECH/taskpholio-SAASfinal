import React from 'react'
import { RiInboxLine } from 'react-icons/ri'

const EmptyState = React.memo(({ title = 'Nothing here yet', body = '', icon: Icon = RiInboxLine, action }) => (
  <div className="empty-state">
    <div className="empty-state__icon">
      <Icon size={22} />
    </div>
    <p className="empty-state__title">{title}</p>
    {body && <p className="empty-state__body">{body}</p>}
    {action}
  </div>
))

export default EmptyState
