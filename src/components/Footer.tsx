import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="padding-global">
        <div className="container w-container">
          <div className="footer-component">
            <div className="footer-bottom-wrapper">
              <a href="mailto:justin@jjohnson.art" className="footer-email w-inline-block">
                <div className="text-size-large">justin@jjohnson.art</div>
                <Image
                  src="/images/Copy-Icon.svg"
                  alt="Copy Icon"
                  className="copy-icon"
                  width={24}
                  height={24}
                />
              </a>
              <div className="footer-links-wrapper">
                <Link
                  href="https://github.com/justinjohnso"
                  target="_blank"
                  className="footer-link w-inline-block"
                >
                  <div className="text-size-regular">Github</div>
                </Link>
                <Link
                  href="https://www.linkedin.com/in/justinjohnso/"
                  target="_blank"
                  className="footer-link w-inline-block"
                >
                  <div className="text-size-regular">LinkedIn</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
