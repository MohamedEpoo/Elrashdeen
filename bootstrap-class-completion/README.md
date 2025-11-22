Bootstrap / Project CSS Class Completion

What it does
- Parses CSS files under `assets/css/` in your workspace and collects class names.
- Provides completion suggestions when editing HTML inside `class="..."` attributes.

Usage
1. Open the `bootstrap-class-completion` folder in VS Code (as an Extension Development Host) and press `F5` to run the extension in a new window.
2. Alternatively, copy the `bootstrap-class-completion` folder into your VS Code extensions folder `%USERPROFILE%\\.vscode\\extensions\\bootstrap-class-completion` and restart VS Code.

Notes
- The extension looks for `assets/css/**/*.css` relative to the first workspace folder. If your CSS lives elsewhere, open an issue or edit `extension.js` pattern accordingly.
- It reloads class names when CSS files in `assets/css/` change.

If you want, I can package this into a VSIX or expand the parser to include `@apply`/SASS rules and more robust parsing.