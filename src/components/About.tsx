import React from 'react'

const About: React.FC = () => {
  return (
    <div className="home-about">
      <div className="padding-global">
        <div className="container w-container">
          <div className="home-about-component center">
            <div className="home-about-wrapper center">
              <h2 className="heading-7 text-weight-regular">
                Hi! I&#x27;m Justin, a multi-disciplinary technologist with a{' '}
                <span className="text-style-italic text-color-grey text-weight-light">
                  background in theatre
                </span>{' '}
                and the{' '}
                <span className="text-style-italic text-color-grey text-weight-light">
                  heart of a tinkerer
                </span>
                . When I&#x27;m not talking to computers, I spend my time{' '}
                <span className="text-style-italic text-color-grey text-weight-light">
                  building interactive auditory worlds
                </span>
                , both through theatre and technology.
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
