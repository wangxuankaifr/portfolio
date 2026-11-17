import { experience } from './content'
import { Icon } from './Icons'
import { publicAsset } from './publicAsset'
import './about-page.css'

const portrait = publicAsset('/media/profile/stromae-wang.png')

export default function AboutPage() {
  return <section className="about-page" id="about-page" aria-labelledby="about-heading">
    <div className="wrap">
      <h1 className="about-name" id="about-heading">Stromae Wang</h1>

      <figure className="about-portrait-frame">
        <span className="about-frame-pin is-top-left" aria-hidden="true"/>
        <span className="about-frame-pin is-top-right" aria-hidden="true"/>
        <span className="about-frame-pin is-bottom-left" aria-hidden="true"/>
        <span className="about-frame-pin is-bottom-right" aria-hidden="true"/>
        <div className="about-portrait-window">
          <img src={portrait} alt="王宣凯的黑白肖像" width="1060" height="1484" fetchPriority="high" decoding="async"/>
        </div>
      </figure>

      <div className="about-biography">
        <h2>About me</h2>
        <div className="about-biography-copy">
          <p className="about-statement">Hi，我是王宣凯。从乙方做品牌创意，到品牌方推进国际新品上市，如今带团队统筹品牌视觉。在奥美，我从提案跟到执行，打磨理解品牌需求、把创意落地的基本功。到了小米，我开始从品牌方的视角看产品上市，参与国际新品发布的视觉设计与内容规划，也以项目经理的身份协同各地市场团队推进整合营销。现在在 FUTURUS，我统筹 To B 和 To C 两条业务线的视觉项目，确定优先级、安排团队分工，也搭建 AI 工作流，把重复制作的时间留给思考与打磨。</p>
          <p className="about-statement">每次定创意方向，我都会先问自己三个问题：品牌需要用户记住什么？这次传播要推动用户做出什么选择？有限的人手和时间，最值得投入在哪里？</p>
          <p className="about-statement">对我来说，AI 像一艘快船，能把想象迅速送到眼前。我更在意掌舵的人看过多少风景，能否辨认暗礁，又打算把品牌带到哪里。船越快，出发前越值得好好看看地图。</p>
        </div>
      </div>

      <details className="about-resume">
        <summary>履历与教育 <span aria-hidden="true"><Icon name="plus"/></span></summary>
        <div className="about-resume-content">
          <div className="about-work-history">
            <h3>工作经历</h3>
            {experience.map(job => <article key={job.company}>
              <div className="about-job-title"><h4>{job.company}</h4><span>{job.date}</span></div>
              <p>{job.role}</p><p className="about-job-description">{job.description}</p>
            </article>)}
          </div>
          <div className="about-education-history">
            <h3>教育经历</h3>
            <p><span>2016–2018</span>巴黎高等视觉传达学院 ECV<br/>广告 · 研究生</p>
            <p><span>2014–2015</span>巴黎高等视觉传达学院 ECV<br/>视觉传达 · 本科</p>
            <p><span>2009–2013</span>西安美术学院<br/>视觉传达 · 本科</p>
          </div>
        </div>
      </details>
    </div>
  </section>
}
