import React from 'react'
import Link from 'next/link'

const ImageGrid: React.FC = () => {
  return (
    <div className="home-images-grid">
      <div className="w-layout-blockcontainer container _1440 w-container">
        <div className="padding-global small">
          <div className="image-grid-component">
            <div className="w-layout-grid images-grid">
              <div className="home-projects-column margin-top">
                <Link
                  href="/projects?categories=Theatre"
                  className="projects-subtitle theatre w-inline-block"
                >
                  <div className="project-bullet-2 static"></div>
                  <div>Theatre</div>
                  <div className="project-bullet-2 static"></div>
                </Link>
                <div className="projects-home-list-wrapper w-dyn-list">
                  <div role="list" className="images-grid-wrapper w-dyn-items">
                    <div role="listitem" className="image-grid-item w-dyn-item">
                      <Link href="#" className="home-project w-inline-block">
                        <div className="project-info full-width">
                          <div className="project-info-top home">
                            <div className="project-card-name">Project Name</div>
                          </div>
                          <div className="project-info-bottom home">
                            <div className="project-card-categories home">
                              <div className="category-chip slim no-hover">
                                <div className="text-size-small text-weight-medium">Category</div>
                              </div>
                            </div>
                            <div className="project-description text-size-small">
                              Project Description
                            </div>
                          </div>
                        </div>
                        <div className="home-projects-image-wrapper">
                          <div
                            className="projects-image"
                            style={{ filter: 'brightness(70%) hue-rotate(0deg) blur(0px)' }}
                          ></div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="home-projects-column">
                <Link
                  href="/projects?categories=Sound+Design"
                  className="projects-subtitle sound-design w-inline-block"
                >
                  <div className="project-bullet-2 static"></div>
                  <div>Sound Design</div>
                  <div className="project-bullet-2 static"></div>
                </Link>
                <div className="projects-home-list-wrapper w-dyn-list">
                  <div role="list" className="images-grid-wrapper w-dyn-items">
                    <div role="listitem" className="image-grid-item w-dyn-item">
                      <Link href="#" className="home-project w-inline-block">
                        <div className="project-info full-width">
                          <div className="project-info-top home">
                            <div className="project-card-name">Project Name</div>
                          </div>
                          <div className="project-info-bottom home">
                            <div className="project-card-categories home">
                              <div className="category-chip slim no-hover">
                                <div className="text-size-small text-weight-medium">Category</div>
                              </div>
                            </div>
                            <div className="project-description text-size-small">
                              Project Description
                            </div>
                          </div>
                        </div>
                        <div className="home-projects-image-wrapper">
                          <div
                            className="projects-image"
                            style={{ filter: 'brightness(70%) hue-rotate(0deg) blur(0px)' }}
                          ></div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="home-projects-column margin-top">
                <Link
                  href="/projects?categories=Web+Development"
                  className="projects-subtitle web-development w-inline-block"
                >
                  <div className="project-bullet-2 static"></div>
                  <div>Web Development</div>
                  <div className="project-bullet-2 static"></div>
                </Link>
                <div className="projects-home-list-wrapper w-dyn-list">
                  <div role="list" className="images-grid-wrapper w-dyn-items">
                    <div role="listitem" className="image-grid-item w-dyn-item">
                      <Link href="#" className="home-project w-inline-block">
                        <div className="project-info full-width">
                          <div className="project-info-top home">
                            <div className="project-card-name">Project Name</div>
                          </div>
                          <div className="project-info-bottom home">
                            <div className="project-card-categories home">
                              <div className="category-chip slim no-hover">
                                <div className="text-size-small text-weight-medium">Category</div>
                              </div>
                            </div>
                            <div className="project-description text-size-small">
                              Project Description
                            </div>
                          </div>
                        </div>
                        <div className="home-projects-image-wrapper">
                          <div
                            className="projects-image"
                            style={{ filter: 'brightness(70%) hue-rotate(0deg) blur(0px)' }}
                          ></div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageGrid
