# FairShare

FairShare is a small, GitHub Pages-ready group expense tracker. It combines the familiar parts of apps like Splitwise, Tricount, and Settle Up with a **Fairness Replay**: preview a future expense and see how it changes the group before adding it to the ledger.

## Features

- Add expenses with equal splits and selected participants.
- See group spend, your current balance, recent activity, and suggested minimum transfers.
- Mark the current settlement plan as handled in the demo flow.
- Use Fairness Replay to try a future expense without changing the ledger, then save it when it looks right.
- Persist data in the browser with `localStorage`; no account, server, or API key is required.
- Responsive layout for desktop and mobile screens.

## Run locally

Because this is a static site, you can open `index.html` directly in a browser. For a local server, use any static server, for example:

```powershell
py -m http.server 8000
```

Then visit `http://localhost:8000` from the `SIMPLE_AGENT_LLM/Copilot` directory.

## Deploy with GitHub Pages

1. Push the contents of this folder to a GitHub repository.
2. Open the repository's **Settings** tab.
3. Select **Pages** under **Code and automation**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the branch containing these files and the `/ (root)` folder, then save.

GitHub Pages will serve `index.html` as the site entrypoint. No build command or dependency installation is needed.

## Project files

- `index.html` - semantic page structure, dashboard, and modal forms.
- `styles.css` - responsive visual system and layout.
- `app.js` - expense calculations, settlement suggestions, Fairness Replay, and local persistence.

## Privacy note

This demo stores expense data only in the current browser's local storage. It is not synced between devices and is not a replacement for a production financial service.