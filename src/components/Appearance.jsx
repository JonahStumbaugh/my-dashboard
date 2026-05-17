import React from 'react'
import MealsCard from './MealsCard.jsx'
import WorkoutCard from './WorkoutCard.jsx'
import HairSkinCard from './HairSkinCard.jsx'
import GroomingCard from './GroomingCard.jsx'
import './Appearance.css'

function Appearance() {
  return (
    <div className="appearance">
      <div className="appearance__grid">
        <div className="appearance__col appearance__col--full">
          <MealsCard />
        </div>
        <div className="appearance__col">
          <WorkoutCard />
        </div>
        <div className="appearance__col">
          <GroomingCard />
        </div>
        <div className="appearance__col appearance__col--full">
          <HairSkinCard />
        </div>
      </div>
    </div>
  )
}

export default Appearance
