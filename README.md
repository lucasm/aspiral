<div align="center">
<a href="https://aspiral.app/">
<img height="128" src="https://aspiral.app/icon.svg">
</a>
</div>
<h1 align="center">
<a href="https://aspiral.app/">Aspiral</a>
</h1>
<p align="center">
<img alt="Languages" src="https://img.shields.io/badge/languages available-3-ffde17">
<img alt="License" src="https://img.shields.io/github/license/lucasm/aspiral?color=ff7157">
<img alt="Issues" src="https://img.shields.io/github/issues/lucasm/aspiral?color=ff4e66">
</p>
<p align="center">
Trusted journalism to fight against misinformation <br>
</p>

## 📰 Aspiral.app

Aspiral is a breaking news headlines application powered by trusted journalism sources and fact-checking agencies. Aspiral encourages the global fighting against misinformation.

- **News headlines** — Breaking news headlines from multiple sources.

- **Trusted** — Renowned journalism sources focused on liberty of expression, democracy, human rights and critical sense.

- **Fact check** — Features fact-checking by international recognized agencies.

- **Internationalized** — Editions available by country (English, Portuguese BR, Portuguese PT).

- **Accessibility** — Free access journalism, fast on slow internet connections and high contrast support.

## 📁 Project Structure

```
aspiral/
├── app/                # Next.js App Router (all routes and layouts)
│   ├── layout.tsx      # Root layout with meta tags and providers
│   ├── page.tsx        # Homepage with feed sections
│   ├── about/          # About page
│   ├── contribute/     # Contribution page
│   └── api/            # API routes
│       └── feed/
│           └── route.ts    # RSS feed API endpoint
├── components/         # React components (client & server)
│   ├── Header.tsx      # Navigation header
│   ├── Footer.tsx      # Footer with locale selector
│   ├── CardFeed.tsx    # Feed card component
│   └── ...
├── locales/            # i18n translation files and feed source configs
│   ├── en.ts
│   ├── pt-BR.ts
│   ├── pt-PT.ts
│   └── feeds/          # Feed URLs by country and category
├── lib/                # Utility functions and helpers
├── styles/             # Global and CSS Module styles
├── public/             # Static assets (icons, manifest.json, logos)
└── tsconfig.json       # TypeScript configuration with path aliases
```

## ❤️ Contribute

[Become a sponsor](https://github.com/sponsors/lucasm) to help maintain active development and get benefits as early Beta access!

- [Wiki](https://github.com/lucasm/aspiral/wiki) for documentation.
- [Discussions](https://github.com/lucasm/aspiral/discussions) for general topics by community.
- [Projects](https://github.com/lucasm/aspiral/projects) for development backlog.

Developers, feel free to open a new issue or send pull requests for bug fixes and features.

## 📜 Legal

Made by [Lucas Maués](https://lucasm.dev/?utm_source=aspiral). All rights reserved to external news sources and trademarks.
