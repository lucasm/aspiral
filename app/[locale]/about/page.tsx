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
            <h2>Mission & Ownership</h2>
            <p>
              Aspiral is a tiny Web Application of news headlines of trusted journalism, without algorithms, independent and ad-free. The
              open source project was founded by <strong>Lucas Maués</strong>, a Brazilian Software Engineer, and maintained by the{' '}
              <strong>open source community</strong> contributors and sponsors.
            </p>
            <p>
              Our mission is to provide a high-signal, low-noise information environment by curating the world’s most reputable sources in
              Technology, Business, Science, Culture, and Global Affairs.
            </p>
            <p>
              Aspiral is a self-funded project, ensuring complete editorial independence from corporate or political interests. We
              prioritize clarity, transparency, and the user’s right to high-quality information.
            </p>
            <h2>Trust Standards & Integrity</h2>
            <p>
              We are committed to the <strong>8 Trust Indicators</strong> established by <em>The Trust Project</em>. Unlike traditional
              aggregators, Aspiral strictly vets every source for its track record of factual reporting and ethical accountability.
            </p>
            <ul>
              <li>
                <strong>Source Validation:</strong> Every publication in our App (e.g., Reuters, AP, The Atlantic, BBC) is manually verified
                for journalistic excellence.
              </li>
              <li>
                <strong>Algorithm Transparency:</strong> Our curation logic favors primary sources and deep-dive journals. Finally, more
                general news outlets. We don't have any other type of filter. We provide sources "as is", to avoid biasing the feed. We
                don't use algorithms that may prioritize engagement over quality.
              </li>
              <li>
                <strong>Content Integrity:</strong> We do not modify original headlines or alter the editorial context of the articles we
                show. We redirect users to the original source.
              </li>

              <li>
                <strong>Democracy and Pluralism by Design:</strong> The App was designed to show feeds in a grid, to avoid the "top news"
                bias of traditional aggregators. Every source is a counterbalance of another, to provide a balanced spectrum of viewpoints.
              </li>
            </ul>

            <h2>Editorial Guidelines</h2>
            <p>
              Our selection process aims to provide a balanced spectrum of viewpoints to prevent ideological echo chambers. We prioritize:
            </p>
            <ul>
              <li>Global news agencies for immediate, factual reporting.</li>
              <li>Analytical journals for deep economic, cultural, scientific, and sociological context.</li>
              <li>Niche publications focused on technology ethics, digital innovation and human rights.</li>
            </ul>

            <h2>Accountability & Corrections</h2>
            <p>
              We believe in the "Right to Correction." If you identify any source that fails to meet our quality standards or notice
              technical errors in how content is displayed, please contact us.
            </p>

            <p>Send an email to:</p>

            <Button component="a" href="mailto:contact@aspiral.com" color="black" size="md" variant="outline">
              contact@aspiral.app
            </Button>

            <Space h="lg" />

            <p>
              <strong>Corrections Policy:</strong> We promptly review reported issues and update our source lists to maintain the integrity
              of our feed.
            </p>

            <h2>Technology</h2>

            <ul>
              <li>RSS Feeds</li>
              <li>Next.js Framework & React</li>
              <li>TypeScript Programming Language</li>
              <li>Vercel Host</li>
              <li>Cloudflare CDN</li>
              <li>GitHub Source Code Repository</li>
            </ul>

            <h2>Accessibility</h2>
            <p>
              Aspiral is committed with Web Accessibility Standards (WCAG) to ensure that our App is usable by everyone, including people
              with disabilities.{' '}
            </p>

            <Space h="lg" />

            <Button component="a" href="/" color="black" size="md">
              Go to Aspiral
            </Button>

            <Space h="lg" />

            <Button
              component="a"
              href="https://github.com/lucasm/aspiral"
              color="grey"
              size="md"
              target="_blank"
              rel="noopener noreferrer"
              variant="outline">
              Source Code
            </Button>

            <Space h="lg" />

            <Button
              component="a"
              href="https://github.com/sponsors/lucasm"
              color="#ff7c7e"
              size="md"
              target="_blank"
              rel="noopener noreferrer">
              ♥ Sponsor
            </Button>
          </article>
        </div>
      </div>
    </section>
  )
}
