import React from 'react'

const Hero: React.FC = () => {
  return (
    <div className="home-hero">
      <div className="padding-global">
        <div className="container w-container">
          <div className="hero-component center">
            <div className="hero-heading">
              <div className="hero-heading-animation first">
                <h1 className="heading-1 text-style-italic thriving">Thriving</h1>
              </div>
              <div className="hero-heading-animation second">
                <h1 className="heading-1">at the intersection</h1>
              </div>
            </div>
            <div className="hero-heading">
              <div className="hero-heading-animation third">
                <h1 className="heading-1">of</h1>
              </div>
              <div className="hero-heading-animation fourth">
                <h1 className="heading-1 text-style-italic technology">art</h1>
              </div>
              <div className="hero-heading-animation fifth">
                <h1 className="heading-1">and</h1>
              </div>
              <div className="hero-heading-animation sixth">
                <h1 className="heading-1 text-style-italic art">technology</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
