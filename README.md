# Simon Kostovcik — Frontend Developer Portfolio

A modern, responsive portfolio built with **HTML, CSS, and vanilla JavaScript**. It showcases selected frontend concepts, the services I offer, and my approach to creating clean, functional websites.

**Live website:** [simokostovcik-hash.github.io/portfolio](https://simokostovcik-hash.github.io/portfolio/)  
**GitHub:** [@simokostovcik-hash](https://github.com/simokostovcik-hash)

## Highlights

- **Responsive layout** — designed for desktop, tablet, and mobile screens.
- **Fast section navigation** — a floating navigation dock with active-section highlighting.
- **Quick search** — jump to a section using the navigation search or `Ctrl + K` / `⌘ + K`; press `Esc` to close it.
- **Smooth interactions** — scroll-triggered reveals, hover details, and a reading-progress indicator.
- **Accessible motion preferences** — reduced animation when `prefers-reduced-motion` is enabled.
- **No build step** — plain static files, ready for GitHub Pages.

## Portfolio Sections

| Section | What you'll find |
| --- | --- |
| Home | Introduction and quick access to the portfolio |
| Projects | Demo websites for AutoDetail Pro Premium and The Good Cut |
| Services | Presentation websites, responsive design, and redesign work |
| About | Background and approach to frontend development |
| Contact | Link to my public GitHub profile |

> **Note:** The showcased websites are portfolio concepts, not commissioned client projects.

## Featured Projects

### AutoDetail Pro Premium

A premium automotive detailing website concept featuring bold typography, a dark visual style, and clear service presentation.

[View live demo](https://simokostovcik-hash.github.io/autodetail-pro-premium/)

### The Good Cut

A barbershop website concept with expressive typography, warm colors, and a distinctive visual identity.

[View live demo](https://simokostovcik-hash.github.io/barber-studio/)

## Tech Stack

- **HTML5** — semantic page structure and accessible content
- **CSS3** — responsive layouts, typography, transitions, and animations
- **Vanilla JavaScript** — mobile navigation, quick search, active-section tracking, and scroll effects
- **GitHub Pages** — static hosting

No framework, package manager, backend, or paid service is required. The design references Google Fonts, so those font files require a network connection; system-font fallbacks are included.

## Project Structure

```text
portfolio/
├── index.html               # Portfolio markup
├── style.css                # Core portfolio styling
├── script.js                # Mobile navigation
├── site-enhancements.css    # Global design and interaction styles
├── site-enhancements.js     # Floating navigation, search, and scroll effects
└── README.md                # Project documentation
```

## Run Locally

Clone or download the repository and open `index.html` in a browser. Alternatively, start a local development server:

```bash
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Deploy to GitHub Pages

1. Upload the five website files and `README.md` to the **root** of your GitHub repository.
2. In **Settings → Pages**, choose **Deploy from a branch**.
3. Select the branch containing `index.html` (usually `main`) and the **`/ (root)`** folder.
4. Save and wait for GitHub Pages to publish the website.
5. Visit the live portfolio URL above. If old styles remain cached, perform a hard refresh.

Keep the CSS and JavaScript filenames unchanged unless you also update their references in `index.html`.

## Future Ideas

Potential improvements include expanded project case studies, more detailed development process notes, performance refinements, and additional accessibility enhancements.

## Author

**Simon Kostovcik** — aspiring frontend developer focused on clean, usable, responsive websites.

[GitHub profile](https://github.com/simokostovcik-hash) · [Portfolio](https://simokostovcik-hash.github.io/portfolio/)
