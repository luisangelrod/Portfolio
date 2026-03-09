# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Modern personal portfolio for Luis Rodriguez, a Systems Architect & Full-Stack Engineer based in Toa Alta, Puerto Rico. Deployed on Netlify.

## Technology Stack

- **HTML5** - Semantic, accessible markup
- **Tailwind CSS** - Utility-first styling via CDN
- **Vanilla JavaScript** - ES6+ features, no jQuery dependency
- **AOS** - Scroll animation library
- **Lucide Icons** - Modern icon library
- **Netlify** - Hosting, forms, and reCAPTCHA integration

## Development

Static site with no build process required. Serve files with any static server:

```bash
# Using Python
python -m http.server 8000

# Using Node
npx serve
```

## Project Structure

```
Portfolio/
├── index.html          # Main portfolio (Tailwind CSS)
├── index-legacy.html   # Original Bootstrap version (backup)
├── themes.css          # Theme variations (Minimalist, Futuristic, Developer-Dark)
├── REFACTOR-PLAN.md    # Full transformation documentation
├── css/                # Legacy CSS (for reference)
├── js/                 # Legacy JS (for reference)
└── img/                # Images and favicons
```

## Key Features

- **Dark/Light Mode**: Toggle with system preference detection
- **Responsive Design**: Mobile-first approach
- **Micro-interactions**: Hover effects, smooth transitions, AOS animations
- **Three Theme Variants**: Set via `data-theme` attribute on `<html>`

## Customization

### Theme Selection
```html
<html data-theme="minimalist">    <!-- Clean, monochrome -->
<html data-theme="futuristic">    <!-- Neon, cyber aesthetic -->
<html data-theme="developer-dark"> <!-- VS Code inspired -->
```

### Adding Projects
Projects are in the `#projects` section. Each project card uses a gradient background with Lucide icon (no image thumbnails). Structure:
- Gradient header with icon
- Title and status badge (Production / In Development / Available on Request)
- Subtitle and description paragraph
- Tech stack badges

### Contact Form
Uses Netlify Forms with reCAPTCHA. Form name must match `name="contact"` attribute.

## Sections

1. **Hero** - Name, title, availability status, CTAs
2. **About** - Bio, location, stats, core strengths
3. **Tech Stack** - Languages, frontend, backend, mobile/desktop, cloud, databases, architecture, AI & payments
4. **Projects** - Key stats + 8 project cards (BerriosPay, GoFleetCare, ShaderForge, Lead Response, NEXUS MCU, CDD-HUB, Retail POS, iOS/macOS)
5. **Case Studies** - BerriosPay deep dive + 3 teaser cards
6. **Contact** - Form and contact info

## Important Files

- `index.html:1-100` - Meta tags, Tailwind config, custom styles
- `index.html:100-200` - Navigation with mobile menu
- `index.html:200-350` - Hero section
- `index.html:350-500` - About section
- `index.html:500-700` - Tech Stack section
- `index.html:700-900` - Projects section
- `index.html:900-1100` - Case Studies section
- `index.html:1100-1300` - Contact section and footer
