import Link from 'next/link'
import Image from 'next/image'
import React from 'react'

const Header: React.FC = () => {
  return (
    <div className="navbar w-nav">
      <div className="padding-global">
        <div className="container w-container">
          <div className="navbar-component">
            <Link
              href="/"
              aria-current="page"
              className="navbar-left-content w-inline-block w--current"
            >
              <Image
                src="/images/pineapple.png"
                alt=""
                className="navbar-logo-image"
                width={50}
                height={50}
              />
              <div className="navbar-logo-text">
                <div className="text-size-medium text-weight-medium link-color-override">
                  Justin Johnson
                </div>
              </div>
            </Link>
            <div className="navigation-wrapper">
              <Link
                href="/"
                aria-current="page"
                className="navigation-link w-inline-block w--current"
              >
                <div className="text-size-regular">Home</div>
              </Link>
              <Link href="/#personal-projects" className="navigation-link w-inline-block">
                <div className="text-size-regular">Personal Projects</div>
              </Link>
              <Link href="/#client-work" className="navigation-link w-inline-block">
                <div className="text-size-regular">Client Work</div>
              </Link>
              <a href="#contact" className="navigation-link w-inline-block">
                <div className="text-size-regular">Contact</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
