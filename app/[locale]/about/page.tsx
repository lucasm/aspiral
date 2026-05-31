import { BannerCarbon, BannerOpenSource, IconAccessibility, IconIFCN, IconTheTrustProject } from '@/components/Icons'
import { Button, Space } from '@mantine/core'
import { getTranslations } from 'next-intl/server'

export default async function AboutPage() {
  const t = await getTranslations()

  return (
    <section className="fullscreen">
      <div className="fullscreen-container">
        <div className="container">
          <article>
            <h1>Aspiral</h1>
            <p>Trusted journalism. Independent editorial. Free information. </p>

            <Button
              component="a"
              href="https://github.com/sponsors/lucasm"
              color="#ff7c7e"
              size="md"
              target="_blank"
              rel="noopener noreferrer">
              ♥ {t('donate')}
            </Button>

            <h2>Mission & Ownership</h2>
            <p>
              Aspiral is an open-source news aggregator providing trusted journalism without algorithms, independent, and completely
              ad-free. The project was founded by <strong>Lucas Maués</strong>, a Brazilian Software Engineer, and is maintained by the{' '}
              <strong>Open Source Community</strong> contributors and sponsors.
            </p>
            <p>
              Our mission is to foster a high-signal, low-noise information environment by curating the world’s most reputable sources in
              Technology, Business, Science, Culture, and Global Affairs.
            </p>
            <p>
              As a self-funded project, Aspiral ensures complete editorial independence from corporate or political interests. We prioritize
              clarity, transparency, and the user’s right to high-quality, unfiltered information.
            </p>

            <h2>Trust Indicators</h2>
            <p>
              We are committed to the <strong>8 Trust Indicators</strong> established by <em>The Trust Project</em>. Unlike traditional
              aggregators, Aspiral strictly vets every source based on its track record of factual reporting and ethical accountability.
            </p>
            <ul>
              <li>
                <strong>Source Validation:</strong> Every publication included (e.g., Reuters, AP, The Atlantic, BBC) is manually verified
                for journalistic excellence.
              </li>
              <li>
                <strong>Algorithm Transparency:</strong> Our curation logic favors primary sources and deep-dive journals. Finally, more
                general news outlets. We don't have any other type of filter. We provide sources "as is", to avoid biasing the feed. We
                don't use algorithms that may prioritize engagement over quality.
              </li>
              <li>
                <strong>Content Integrity:</strong> We do not modify original headlines or alter editorial contexts. Users are always
                redirected to the original source.
              </li>
              <li>
                <strong>Pluralism by Design:</strong> Our grid-based interface prevents "top news" bias. Sources are positioned to act as
                counterbalances to one another, ensuring a balanced spectrum of viewpoints.
              </li>
            </ul>

            <h2>Editorial Guidelines</h2>
            <p>Our selection process aims to dissolve ideological echo chambers by prioritizing:</p>
            <ul>
              <li>
                <strong>Global news agencies:</strong> for immediate, factual reporting.
              </li>
              <li>
                <strong>Analytical journals:</strong> for deep economic, cultural, scientific, and sociological context.
              </li>
              <li>
                <strong>Niche publications:</strong> focused on technology ethics, digital innovation, and human rights.
              </li>
            </ul>

            <h2>Accountability & Corrections</h2>
            <p>
              We uphold the "Right to Correction." If you identify a source that fails to meet our quality standards or notice technical
              errors in content display, please let us know. Contact us at email:
            </p>

            <Button component="a" href="mailto:contact@aspiral.app" color="black" size="md" variant="outline">
              contact@aspiral.app
            </Button>

            <Space h="lg" />

            <p>
              <strong>Corrections Policy:</strong> We promptly review reported issues and update our source lists to maintain the integrity
              of the feed.
            </p>

            <h2>Technology</h2>
            <ul>
              <li>RSS Feeds (Source of Truth)</li>
              <li>React with Next.js (Framework)</li>
              <li>TypeScript (Programming Language)</li>
              <li>Vercel (Hosting)</li>
              <li>Cloudflare (Edge Network, Security, Domain & CDN)</li>
              <li>GitHub (Open Source Repository)</li>
            </ul>

            <Button
              component="a"
              href="https://github.com/lucasm/aspiral"
              color="black"
              size="md"
              target="_blank"
              rel="noopener noreferrer"
              variant="outline">
              Source Code
            </Button>

            <ul>
              <li>
                <a href="https://opensource.org/" target="_blank" rel="external noopener noreferrer">
                  <BannerOpenSource />
                  Open Source Initiative
                </a>
              </li>
              <li>
                <a href="https://www.w3.org/WAI/" target="_blank" rel="external noreferrer">
                  <IconAccessibility />
                  Web Accessibility Initiative
                </a>
              </li>
              <li>
                <a href="https://www.websitecarbon.com/website/aspiral-app/" target="_blank" rel="external noreferrer">
                  <BannerCarbon />
                  Website Carbon
                </a>
              </li>
              <li>
                <a href="https://thetrustproject.org/" target="_blank" rel="external noreferrer">
                  <IconTheTrustProject />
                  The Trust Project
                </a>
              </li>
              <li>
                <a href="https://ifcncodeofprinciples.poynter.org/signatories" target="_blank" rel="external noreferrer">
                  <IconIFCN />
                  International Fact-Checking Network
                </a>
              </li>
            </ul>

            <h2>Accessibility</h2>
            <p>
              Aspiral is committed to Web Accessibility Standards (WCAG), ensuring our platform is usable by everyone, regardless of
              ability.
            </p>

            <Button component="a" href="/" color="black" size="md">
              Go to Aspiral
            </Button>
          </article>
        </div>
      </div>
    </section>
  )
}
