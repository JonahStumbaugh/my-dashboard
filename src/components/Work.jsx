import React from 'react'
import PrioritiesCard from './PrioritiesCard.jsx'
import HoursCard from './HoursCard.jsx'
import WorkTasksCard from './WorkTasksCard.jsx'
import MeetingNotesCard from './MeetingNotesCard.jsx'
import './Work.css'

const today = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
})

function Work() {
  return (
    <div className="work">

      {/* Professional header banner */}
      <div className="work__banner">
        <div className="work__banner-left">
          <div className="work__bank-logo">KB</div>
          <div>
            <div className="work__bank-name">Kish Bank</div>
            <div className="work__bank-role">Finance &amp; Accounting Internship</div>
          </div>
        </div>
        <div className="work__banner-right">
          <div className="work__banner-date">{today}</div>
        </div>
      </div>

      {/* Grid */}
      <div className="work__grid">
        <div className="work__col">
          <PrioritiesCard />
        </div>
        <div className="work__col">
          <HoursCard />
        </div>
        <div className="work__col work__col--full">
          <WorkTasksCard />
        </div>
        <div className="work__col work__col--full">
          <MeetingNotesCard />
        </div>
      </div>

    </div>
  )
}

export default Work
