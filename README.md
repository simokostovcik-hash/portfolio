# Simon Kostovcik — Frontend Developer Portfolio

A modern, responsive portfolio built with **HTML, CSS, and vanilla JavaScript**. It showcases selected frontend concepts, the services I offer, and **STAVBA**, an interactive bridge-building game featuring a custom 2D physics simulation.

**Live website:** [simokostovcik-hash.github.io/portfolio](https://simokostovcik-hash.github.io/portfolio/)  
**GitHub:** [@simokostovcik-hash](https://github.com/simokostovcik-hash)

## Highlights

- **Responsive layout** — designed for desktop, tablet, and mobile screens.
- **Fast section navigation** — a floating navigation dock with active-section highlighting.
- **Quick search** — jump to a section using the navigation search or `Ctrl + K` / `⌘ + K`; press `Esc` to close it.
- **Smooth interactions** — scroll-triggered reveals, hover details, and a reading-progress indicator.
- **Accessible motion preferences** — reduced animation when `prefers-reduced-motion` is enabled.
- **STAVBA game** — draw beams, reinforce structures, and test their stability across five levels.
- **No build step** — plain static files, ready for GitHub Pages.

## Portfolio Sections

| Section | What you'll find |
| --- | --- |
| Home | Introduction and quick access to the portfolio |
| Projects | Demo websites for AutoDetail Pro Premium and The Good Cut |
| Services | Presentation websites, responsive design, and redesign work |
| About | Background and approach to frontend development |
| STAVBA | Interactive construction and physics game |
| Contact | Link to my public GitHub profile |

> **Note:** The showcased websites are portfolio concepts, not commissioned client projects.

## Featured Projects

### AutoDetail Pro Premium

A premium automotive detailing website concept featuring bold typography, a dark visual style, and clear service presentation.

[View live demo](https://simokostovcik-hash.github.io/autodetail-pro-premium/)

### The Good Cut

A barbershop website concept with expressive typography, warm colors, and a distinctive visual identity.

[View live demo](https://simokostovcik-hash.github.io/barber-studio/)

## STAVBA — Build, Test, Improve

STAVBA is an engineering-inspired browser game in which you draw beams, connect joints, and design structures that can withstand gravity. Five levels introduce increasingly difficult challenges, including wind, restricted ground anchors, obstacles, and limited materials and test attempts.

### How to Play

1. Select **Start Building** (the game interface uses Czech labels).
2. **Click or touch, drag, and release** on the canvas to draw a beam.
3. Connect beam endpoints into joints. Triangular bracing generally improves structural rigidity.
4. Build toward the highlighted target area and reach the required height.
5. Run a **gravity test**. Your structure must hold the target for **three seconds**.
6. If a test fails and attempts remain, revise your structure and test again.

Use the on-screen undo button, `Ctrl + Z`, or `Backspace` to remove the last beam. Restart the current level when needed. Star ratings reward efficient use of beams.

**Physics note:** STAVBA uses a simplified 2D simulation with Verlet-style integration, gravity, constraints between joints, and level-specific forces. It is intended for gameplay, **not** real-world engineering or structural safety analysis.

## Tech Stack

- **HTML5** — semantic page structure, accessible content, and the game canvas
- **CSS3** — responsive layouts, typography, transitions, and animations
- **Vanilla JavaScript** — navigation, quick search, scroll effects, game logic, and physics
- **GitHub Pages** — static hosting

No framework, package manager, backend, or paid service is required. The design references Google Fonts, so those font files require a network connection; system-font fallbacks are included.

## Project Structure

```text
portfolio/
├── index.html               # Portfolio markup and game section
├── style.css                # Core portfolio styling
├── script.js                # Mobile navigation
├── site-enhancements.css    # Global design and interaction styles
├── site-enhancements.js     # Floating navigation, search, and scroll effects
├── tower-game.css           # STAVBA interface styling
├── tower-game.js            # Game rules, canvas rendering, and physics
└── README.md                # Project documentation
```

## Run Locally

Clone or download the repository and open `index.html` in a browser. Alternatively, start a local development server:

```bash
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Deploy to GitHub Pages

1. Upload all seven website files and `README.md` to the **root** of your GitHub repository.
2. In **Settings → Pages**, choose **Deploy from a branch**.
3. Select the branch containing `index.html` (usually `main`) and the **`/ (root)`** folder.
4. Save and wait for GitHub Pages to publish the website.
5. Visit the live portfolio URL above. If old styles remain cached, perform a hard refresh.

Keep the CSS and JavaScript filenames unchanged unless you also update their references in `index.html`.

## Future Ideas

Potential improvements include expanded project case studies, additional STAVBA levels, optional sound effects, saved game progress, performance refinements, and further accessibility enhancements.

## Author

**Simon Kostovcik** — aspiring frontend developer focused on clean, usable, responsive websites.

[GitHub profile](https://github.com/simokostovcik-hash) · [Portfolio](https://simokostovcik-hash.github.io/portfolio/)
