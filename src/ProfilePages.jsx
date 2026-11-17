import { profile } from './content'
import { Icon } from './Icons'
import { publicAsset } from './publicAsset'
import './contact-page.css'

const contactSkills = [
  'BRAND DESIGN LEADER',
  'GLOBAL PRODUCT LAUNCHES',
  'CREATIVE DIRECTION',
  'BRAND IDENTITY SYSTEMS',
  'TECHNICAL STORYTELLING',
  'AI-ASSISTED WORKFLOWS',
]

export function Contact() {
  const phoneHref = `tel:${profile.phone.replaceAll(' ', '')}`

  return <section id="contact-page" className="contact-page" aria-labelledby="contact-heading" lang="en">
    <div className="wrap contact-layout">
      <header className="contact-heading">
        <h1 id="contact-heading">CONTACT</h1>
        <Icon name="diagonal" className="contact-direction"/>
      </header>

      <div className="contact-content">
        <dl className="contact-details">
          <div><dt>PHONE</dt><dd><a href={phoneHref}>{profile.phone}</a></dd></div>
          <div><dt>ADDRESS</dt><dd>Beijing, China</dd></div>
          <div><dt>MAIL</dt><dd><a href={`mailto:${profile.email}`}>{profile.email}</a></dd></div>
        </dl>

        <figure className="contact-portrait">
          <img src={publicAsset('/media/profile/stromae-wang.png')} alt="Black-and-white portrait of Stomae Wang"
            width={1060} height={1484} fetchPriority="high" decoding="async"/>
        </figure>

        <footer className="contact-footer">
          <ul className="contact-skills">
            {contactSkills.map(skill => <li key={skill}>
              <span aria-hidden="true">/</span><span>{skill}</span>
            </li>)}
          </ul>
          <p className="contact-year">@2026 <span lang="zh-CN">王宣凯</span></p>
        </footer>
      </div>
    </div>
  </section>
}

