import React from 'react'

const ContactModal: React.FC = () => {
  return (
    <section id="contact" className="contact-modal-wrapper">
      <div className="contact-modal">
        <div className="w-layout-blockcontainer container small w-container">
          <div className="padding-global">
            <div className="contact-form margin">
              <div className="contact-content-wrapper black">
                <p className="text-style-italic text-weight-light">
                  Did my work catch your eye? Let&#x27;s chat!
                </p>
                <h2 className="contact-heading">
                  I&#x27;m always interested in collaborations and new projects!
                </h2>
              </div>
              <div className="global-contact-form w-form">
                <form
                  id="wf-form-Contact-Form"
                  name="wf-form-Contact-Form"
                  data-name="Contact Form"
                  method="post"
                  className="form"
                >
                  <label htmlFor="Name-2" className="text-size-medium text-weight-regular">
                    Name
                  </label>
                  <input
                    className="text-field marble w-input"
                    maxLength={256}
                    name="Name"
                    data-name="Name"
                    placeholder="Enter your name"
                    type="text"
                    id="Name-2"
                    required
                  />
                  <label htmlFor="Email-2" className="text-size-medium text-weight-regular">
                    Email Address
                  </label>
                  <input
                    className="text-field marble w-input"
                    maxLength={256}
                    name="Email"
                    data-name="Email"
                    placeholder="Enter your email"
                    type="email"
                    id="Email-2"
                    required
                  />
                  <label htmlFor="Message-2" className="text-size-medium text-weight-regular">
                    Message
                  </label>
                  <textarea
                    id="Message-2"
                    name="Message"
                    maxLength={5000}
                    data-name="Message"
                    placeholder="Your message..."
                    required
                    className="message-field marble w-input"
                  ></textarea>
                  <div className="form-button">
                    <input
                      type="submit"
                      data-wait="Please wait..."
                      className="contact-form-button w-button"
                      value="Send an email"
                    />
                  </div>
                </form>
                <div className="success-message w-form-done">
                  <div className="text-size-medium">
                    Thank you! Your submission has been received!
                  </div>
                </div>
                <div className="error-message w-form-fail">
                  <div className="text-size-medium">
                    Oops! Something went wrong while submitting the form.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-offset"></div>
    </section>
  )
}

export default ContactModal
