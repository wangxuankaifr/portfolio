import { experience, profile } from './content'
import { Icon } from './Icons'
import { MobileImage } from './MobileMedia'
import './mobile-profile.css'

const portrait = '/media/profile/stromae-wang.png'
const skills = [
  'BRAND DESIGN LEADER',
  'GLOBAL PRODUCT LAUNCHES',
  'CREATIVE DIRECTION',
  'BRAND IDENTITY SYSTEMS',
  'TECHNICAL STORYTELLING',
  'AI-ASSISTED WORKFLOWS',
]

export function MobileAbout() {
  return <section className="m-profile-page m-about" aria-labelledby="m-about-title">
    <header className="m-profile-heading">
      <h1 id="m-about-title">Stomae<br/>Wang</h1>
      <p>Brand Design Lead<br/>Art Direction</p>
    </header>

    <figure className="m-about-portrait">
      <MobileImage src={portrait} alt="王宣凯的黑白肖像" width={1060} height={1484} priority/>
      <span className="m-portrait-corner is-top" aria-hidden="true"/>
      <span className="m-portrait-corner is-bottom" aria-hidden="true"/>
    </figure>

    <div className="m-about-copy">
      <h2>About me</h2>
      <p>Hi，我是王宣凯。从乙方做品牌创意，到品牌方推进国际新品上市，如今带团队统筹品牌视觉。</p>
      <p>现在在 FUTURUS，我统筹 To B 和 To C 两条业务线的视觉项目，确定优先级、安排团队分工，也搭建 AI 工作流，把重复制作的时间留给思考与打磨。</p>

      <details className="m-profile-details">
        <summary>更多关于我<Icon name="plus"/></summary>
        <div className="m-profile-expanded">
          <p>在奥美，我从提案跟到执行，打磨理解品牌需求、把创意落地的基本功。到了小米，我开始从品牌方的视角看产品上市，参与国际新品发布的视觉设计与内容规划，也以项目经理的身份协同各地市场团队推进整合营销。</p>
          <p>每次定创意方向，我都会先问自己三个问题：品牌需要用户记住什么？这次传播要推动用户做出什么选择？有限的人手和时间，最值得投入在哪里？</p>
          <p>对我来说，AI 像一艘快船，能把想象迅速送到眼前。我更在意掌舵的人看过多少风景，能否辨认暗礁，又打算把品牌带到哪里。船越快，出发前越值得好好看看地图。</p>
        </div>
      </details>

      <details className="m-profile-details m-profile-resume">
        <summary>履历与教育<Icon name="plus"/></summary>
        <div className="m-profile-expanded">
          <h3>工作经历</h3>
          {experience.map(job => <article className="m-profile-job" key={job.company}>
            <div><h4>{job.company}</h4><span>{job.date}</span></div>
            <p className="m-profile-role">{job.role}</p>
            <p>{job.description}</p>
          </article>)}
          <h3>教育经历</h3>
          <div className="m-profile-education">
            <p><span>2016–2018</span>巴黎高等视觉传达学院 ECV<br/>广告 · 研究生</p>
            <p><span>2014–2015</span>巴黎高等视觉传达学院 ECV<br/>视觉传达 · 本科</p>
            <p><span>2009–2013</span>西安美术学院<br/>视觉传达 · 本科</p>
          </div>
        </div>
      </details>
    </div>

    <a className="m-profile-contact-link" href="#contact"><span>联系我</span><Icon name="diagonal"/></a>
  </section>
}

export function MobileContact() {
  return <section className="m-profile-page m-contact" aria-labelledby="m-contact-title">
    <header className="m-contact-heading">
      <h1 id="m-contact-title">CONTACT</h1>
      <Icon name="diagonal"/>
    </header>

    <div className="m-contact-grid">
      <figure className="m-contact-portrait">
        <MobileImage src={portrait} alt="王宣凯的黑白肖像" width={1060} height={1484} priority/>
      </figure>
      <dl className="m-contact-details" lang="en">
        <div><dt>PHONE</dt><dd><a href={`tel:${profile.phone.replaceAll(' ', '')}`}>{profile.phone}</a></dd></div>
        <div><dt>ADDRESS</dt><dd>Beijing, China</dd></div>
        <div><dt>MAIL</dt><dd><a href={`mailto:${profile.email}`}>{profile.email}</a></dd></div>
      </dl>
    </div>

    <ul className="m-contact-skills" lang="en">
      {skills.map(skill => <li key={skill}><span aria-hidden="true">/</span>{skill}</li>)}
    </ul>

    <footer className="m-contact-footer"><span>@2026 王宣凯</span></footer>
  </section>
}
