import { useTranslations } from 'next-intl'

import WebsiteLayout from '@/layouts/WebsiteLayout'
import Style from '@/layouts/WebsiteLayout/WebsiteLayout.module.css'

export const metadata = {
  title: 'Privacy Policy',
  description: 'See how Aspiral respects your privacy and user data.',
}

export default function PrivacyPage() {
  const t = useTranslations('t')
  return (
    <WebsiteLayout>
      <section>
        <div className={Style.container}>
          <div className={Style.pageTitle}>
            <h1>{t('privacy')}</h1>
          </div>
        </div>
      </section>

      <section>
        <div className={Style.container}>
          <article>
            <h2>1. Your Privacy on Aspiral</h2>
            <p>
              We respect your privacy regarding any information we may collect
              from you across our services at internet domain https://aspiral.app
              and our communications (&quot;Aspiral&quot;). Aspiral is designed
              on top of privacy. Aspiral endorses user control over their data.
              We do not store user searches. External services and search
              providers may collect and store your personal data. Thinking about
              it, Aspiral displays a &quot;Protection widget&quot; on top of
              every search provider, explore it!
            </p>
            <p>This privacy policy complies with the following regulations:</p>

            <ul>
              <li>Brazil: General Data Protection Law (LGPD)</li>
              <li>European Union: General Data Protection Regulation (GDPR)</li>
              <li>United States: California Consumer Privacy Act (CCPA)</li>
              <li>
                China: Personal Information Protection Law (PIPL) and Data
                Security Law
              </li>
              <li>
                Russia: Federal Law on Personal Data Protection (Law No. 152-FZ)
              </li>
            </ul>

            <p>
              We currently follow these robust regulations, which sets
              guidelines for the collection, storage, and processing of personal
              data.{' '}
            </p>

            <p>
              Using Aspiral you are agreeing to be bound by this privacy
              policy.{' '}
            </p>
            <h2>2. Automatically Collected Information</h2>
            <p>
              Aspiral automatically collects and stores minimal public information
              (non personal data) with purpose to provide web search
              functionality. Such as pages that you access, location (country
              and city), device specs (operational system and browser), internet
              service provider, IP address, referral URL, exit pages, time
              stamp, and similar data about its use and interaction.
            </p>
            <h2>3. Information that You Provide</h2>
            <p>
              Aspiral only receives and stores identifiable information (personal
              data) for those who chose identify themselves. Data that you enter
              on contact or feedback forms, donations platforms or give in any
              other way, including but not limited to: your name, email address
              and phone number.
            </p>
            <p>
              Aspiral only asks for personal information when we truly need it to
              provide a service to you. We collect it by fair and lawful means,
              with your knowledge and consent. We also let you know why
              we&apos;re collecting it and how it will be used.
            </p>
            <h2>4. Information Using</h2>
            <p>Aspiral uses your information only with the purposes of: </p>
            <p>
              a) communicate with you to understand your feedback, respond to
              inquiries and provide requested content;
            </p>
            <p>
              b) anonymously analyze the users behavior to personalize and
              improve general user experience;
            </p>
            <p>
              c) detect and prevent activities that be illegal, harmful to
              people and organizations or violate copyright, intellectual
              property rights or cybersecurity.
            </p>
            <h2>5. Cookies and Tracking Technologies</h2>
            <p>
              Aspiral and its related email communications use cookies and
              similar technologies, such as cache and local storage, only to
              execute app functionalities, like to recognize when you view or
              return to a page.{' '}
            </p>
            <p>
              The{' '}
              <a
                href="https://www.cloudflare.com/privacypolicy/"
                target="_blank"
                rel="noopener noreferrer">
                Cloudflare
              </a>
              ,{' '}
              <a
                href="https://support.google.com/analytics/answer/6004245"
                target="_blank"
                rel="noopener noreferrer">
                Google Analytics
              </a>{' '}
              and{' '}
              <a
                href="https://privacy.microsoft.com/privacystatement"
                target="_blank"
                rel="noopener noreferrer">
                Microsoft Clarity
              </a>{' '}
              services are used to optimize Aspiral, and can put their own
              cookies in your browser. This policy not covers use of cookies by
              third parties. Click on the links above to read their privacy
              policies.{' '}
            </p>
            <p>
              If you use an &quot;ad blocker&quot; browser extension or have
              enabled &quot;do not track&quot; or similar functionality on your
              browser settings, the cookies maybe are not set.
            </p>
            <h2>6. Information Sharing</h2>
            <p>
              Aspiral does not share any personally identifying information with
              third-parties. But for technical reasons and unintentionally, it
              may share with the services listed above and when redirecting the
              user to a search provider. These entities may have access to
              personal information to perform their functions.
            </p>
            <h2>7. Information Store and Protection</h2>
            <p>
              Aspiral only retains collected information for as long as necessary
              to provide to you the requested service. The data we store,
              we&apos;ll protect within commercially acceptable means to prevent
              unauthorized access. You are free to refuse our request for your
              personal information, with the understanding that we may be unable
              to provide you with some of your desired services.
            </p>
            <h2>8. Opting Out</h2>
            <p>
              Aspiral strongly encourages you to take a look at third parties&apos;
              privacy policies linked above and of every search provider, to
              know how this services are handling your data and how proceed to
              opt out of them individually.
            </p>
            <h2>9. External Services</h2>
            <p>
              Aspiral redirects and contains links to external websites and
              applications just for your convenience of search functionality.
              Please be aware that Aspiral does not endorse or have control over the
              content and practices of any third party internet resources, and
              cannot accept liability or responsibility for their respective
              privacy policies, which are not operated by Aspiral. We advise you
              to review the privacy policy of each one where possible.
            </p>
            <h2>10. Changes to This Policy</h2>
            <p>
              Note that this policy can be revised at any time without notice.
              However, significant changes will be announced on Aspiral&apos;s
              communication channels. Your continued use of Aspiral, following
              the posting of changes, will be regarded as acceptance of these
              changes.
            </p>
            <h2>11. Contact</h2>
            <p>
              If you have any questions or suggestions, please contact us at
              email legal@aspiral.app. Happy searches!
            </p>
            <p>Updated and Effective as of November 21, 2026.</p>
          </article>
        </div>
      </section>
    </WebsiteLayout>
  )
}
