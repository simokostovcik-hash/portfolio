# Simon Kostovcik — Frontend Developer Portfolio

A modern, responsive portfolio built with **HTML, CSS, and vanilla JavaScript**. It showcases selected frontend concepts, the services I offer, and **STAVBA**, an interactive bridge-building game with a custom 2D physics simulation.

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
| STAVBA | Interactive construction and physics game |
| Contact | Link to my public GitHub profile |

> **Note:** The showcased websites are portfolio concepts, not commissioned client projects.

## STAVBA — Build, Test, Improve

STAVBA is a small engineering-inspired game in which you draw beams, connect joints, and build a structure that can survive gravity. It features **five levels**, progressively introducing constraints such as wind, restricted ground anchors, obstacles, and limited resources.

### How to play

1. Select **Start Building** (the interface may display Czech labels).
2. **Click or touch, drag, and release** on the game canvas to draw a beam.
3. Connect beam endpoints into joints. Triangular bracing generally makes structures more rigid.
4. Reach the highlighted target area or required height.
5. Run the **gravity test**. Your structure must remain stable in the target area for **three seconds**.
6. If the test fails and you still have attempts remaining, revise the design and try again.

You can undo the last beam with the on-screen button, `Ctrl + Z`, or `Backspace`. Use the restart control to retry the current level. The game also awards stars based on how efficiently you use beams.

**Physics note:** The simulation uses a simplified 2D model with Verlet-style integration, gravity, constraints between joints, and level-specific forces. It is a game mechanic, **not** an engineering or structural-safety tool.

## Tech Stack

- **HTML5** — semantic content and the game canvas
- **CSS3** — responsive layouts, typography, transitions, and animations
- **Vanilla JavaScript** — navigation, interactions, game logic, and physics
- **GitHub Pages** — static hosting

No framework, package manager, backend, or paid service is required. The design references Google Fonts, so those font files require a network connection; system-font fallbacks are included.

## Project Structure

```text
portfolio/
├── index.html               # Portfolio markup and game section
├── style.css                # Core portfolio styling
├── script.js                # Mobile navigation
├── site-enhancements.css    # Global redesign and interaction styles
├── site-enhancements.js     # Floating navigation, search, and scroll effects
├── tower-game.css           # STAVBA interface styling
├── tower-game.js            # Game rules, canvas rendering, and physics
└── README.md                # Project documentation
```

## Run Locally

Clone or download the repository and open `index.html` in a browser. For a local development server, you can also run:

```bash
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Deploy to GitHub Pages

1. Upload all eight files to the **root** of your GitHub repository.
2. In **Settings → Pages**, choose **Deploy from a branch**.
3. Select the branch containing `index.html` (usually `main`) and the **`/ (root)`** folder.
4. Save and wait for GitHub Pages to publish the website.
5. Visit the live portfolio URL above. If old styles remain cached, refresh the page without cache.

Keep the CSS and JavaScript filenames unchanged unless you also update their references in `index.html`.

## Future Ideas

Potential improvements include additional STAVBA levels, sound effects with a mute toggle, persistent level progress, and expanded project case studies.

## Author

**Simon Kostovcik** — aspiring frontend developer focused on clean, usable, responsive websites.

[GitHub profile](https://github.com/simokostovcik-hash) · [Portfolio](https://simokostovcik-hash.github.io/portfolio/)
