# Chatbot n8n Integration & CSS Fix

## Issue
1. **Integration**: The chatbot was failing to process responses from n8n due to plain text responses causing JSON parse errors.
2. **CSS/UI**: The chatbot responses were unformatted plain text.
3. **ReactMarkdown Error**: The `className` prop on `<ReactMarkdown>` caused a crash in newer versions.
4. **Product List Readability**: Products listed by the bot were hard to distinguish from one another.
5. **Supabase Warning**: "Multiple GoTrueClient instances detected" during development.

## Fix
### Integration
- Updated `src/lib/n8n.js` to handle both JSON and plain text responses gracefully.

### UI/CSS
- Installed `react-markdown`.
- Updated `src/components/ChatWidget.jsx` to render bot messages using Markdown.
- **Fix for Crash**: Wrapped `<ReactMarkdown>` in a `<div>` to apply Tailwind classes.
- **Product Separation**:
    - Added `border-b` (bottom border) to list items (`<li>`) to visually separate products.
    - Added styling for horizontal rules (`<hr>`) just in case the bot uses them.
    - Increased spacing between list items.

### Supabase
- Updated `src/lib/supabase.js` to use a **Singleton Pattern** during development.
    - This prevents multiple instances of the Supabase client from being created when the file is hot-reloaded, eliminating the "Multiple GoTrueClient instances" warning.

## Verification
1. **Restart the Application**: Ensure the dev server picks up the new dependency (`npm run dev`).
2. **Test the Chatbot**: Send a message like "Liste os produtos".
   - Each product should now have a thin line separating it from the next, making the list much cleaner.
3. **Check Console**: The "Multiple GoTrueClient instances" warning should no longer appear (or at least not multiply on every save).

## Next Steps
- If the styling looks off, we can adjust the Tailwind classes in `ChatWidget.jsx`.
