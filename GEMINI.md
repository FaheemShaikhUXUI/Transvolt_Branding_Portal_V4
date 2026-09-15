# Project Rules & Instructions

## Localhost Verification Rule
Whenever the user asks for the localhost link or URL (or asks to view, test, open, or access localhost):
1. **Always verify active status first**: Check if the local development server is running and responding (e.g., via `curl.exe -I http://localhost:3000` or port check).
2. **Auto-start if inactive**: If the server is not running, automatically launch `npm run dev` as a daemon process and wait until it responds with HTTP 200.
3. **Report health & URL**: Provide the exact working link (`http://localhost:3000`) along with confirmation of the verification check (e.g., HTTP 200 OK, port status). Never provide an unverified localhost link.

## Testing Rule
- **No Automatic Agent / Browser Testing**: NEVER auto-run `browser_subagent` or automated testing sessions.
- Only proceed with testing when the user explicitly requests or instructs you to test.
- Avoid unnecessary token consumption and latency by keeping changes direct, clean, and fast.
