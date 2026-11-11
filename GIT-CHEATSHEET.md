# Terminal & Git cheat sheet (Hotel Points Optimizer)

Written for this project's exact setup: repo on GitHub (`prabhanjanbalakrishnan/Hotel-Points-Optimizer`), branch `main`, Vercel auto-deploys every push to `main`, and your Mac's keychain remembers your GitHub login.

Anything in `<angle brackets>` is for you to fill in. Everything else you can copy as-is.

---

## 1. The everyday loop: save my work and push it

Run these one at a time, in this order.

```bash
cd "/Users/prabhanjanbalakrishnan/Career and Development/Projects/Claude Code Projects/Hotel Points Optimizer"
```
Go to the project folder (the quotes matter because the path has spaces). Skip this if the terminal is already there. Check with `pwd`.

```bash
git status
```
**Always look first.** Red/`modified` = changed, `Untracked` = brand-new files. If a file is listed that you didn't expect (anything like `.env`, passwords, big junk), stop and ask before continuing.

```bash
git add -A
```
Stage everything that changed.

```bash
git commit -m "Short description of what changed"
```
Save a snapshot. Write it like a headline: `Add status tracker to result cards`.

```bash
git push
```
Send it to GitHub. Vercel then redeploys the live site by itself in about a minute.

**That's the whole loop:** `status` → `add -A` → `commit -m "..."` → `push`.

If Claude gave you a commit message with a `Co-Authored-By:` line, that's just a second `-m`:
```bash
git commit -m "Your headline" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```
It's optional; leaving it off changes nothing about the code.

---

## 2. Before you commit (optional but smart)

From the `app` folder:

```bash
cd app
npm run lint     # style/bug check. One "fast refresh" warning in OptimizerContext.jsx is normal.
npm run build    # proves the site still builds. Delete the dist folder afterwards (it's ignored by git anyway).
cd ..
```

---

## 3. When `git push` fails

### "rejected ... (fetch first)" or "non-fast-forward"
GitHub has changes you don't have (for example, a pull request merged on the website).
```bash
git pull --no-rebase
git push
```
- If git opens a text editor for a merge message: just save and close it (in `vim`, type `:wq` and press Enter).
- If it says **CONFLICT**: open the named files, search for `<<<<<<<`, keep the right version, delete the `<<<<<<<`, `=======` and `>>>>>>>` lines, then:
  ```bash
  git add -A
  git commit -m "Merge changes from GitHub"
  git push
  ```
  Not sure which side to keep? Stop and ask Claude, pasting the file.

### "403", "Authentication failed", or it asks for a username/password
Your GitHub token expired or is wrong.
1. On GitHub: your profile picture → **Settings** → **Developer settings** → **Personal access tokens** → generate a new one (tick the `repo` permission). Copy it once; GitHub never shows it again.
2. Make the Mac forget the old one:
   ```bash
   printf "protocol=https\nhost=github.com\n\n" | git credential-osxkeychain erase
   ```
3. Push again. When asked, enter your GitHub **username** and paste the **token as the password** (nothing shows while you paste, which is normal).
   ```bash
   git push
   ```
   The keychain remembers it from then on.

**Never paste a token into a chat, a file, or a commit.** Treat it like a password.

---

## 4. Look around (safe, changes nothing)

| Want to know... | Type |
|---|---|
| What changed since the last commit? | `git status` |
| How big is the change? | `git diff --stat` |
| The actual line-by-line change | `git diff` (press `q` to leave) |
| Recent commits | `git log --oneline -8` |
| Did my push reach GitHub? | `git status` → look for "up to date with 'origin/main'" |
| Which branch am I on? | `git branch --show-current` |
| Where does this push to? | `git remote -v` |

---

## 5. Oops, undo

| Situation | Type | Safe? |
|---|---|---|
| Staged a file by mistake (before commit) | `git restore --staged <file>` | Yes |
| Typo in my **last commit message**, not pushed yet | `git commit --amend -m "Better message"` | Yes, if not pushed |
| Undo my last commit but **keep the work** | `git reset --soft HEAD~1` | Yes, if not pushed |
| Throw away my edits to one file | `git restore <file>` | **Destroys those edits, no undo** |
| Throw away *everything* uncommitted | don't: ask first | |

Already pushed it? Don't rewrite history. Make a new commit that fixes it instead.

**Never use `git push --force`** unless someone who knows the repo tells you to.

---

## 6. Running the app

```bash
cd app
npm run dev        # starts the site at http://localhost:5174  (press Ctrl+C to stop)
npm run lint       # check for problems
npm run build      # production build
```
First time on a fresh copy of the project: `npm install` once, inside `app`.

---

## 7. Terminal survival kit

| Do this | Type / press |
|---|---|
| Where am I? | `pwd` |
| What's in here? | `ls` |
| Go into a folder | `cd foldername` |
| Go up one folder | `cd ..` |
| Folder name has spaces | wrap in quotes: `cd "Claude Code Projects"` |
| Easiest way to type a path | drag the folder from Finder into the terminal window |
| Repeat / edit a previous command | **↑** arrow |
| Auto-finish a name | **Tab** |
| Stop a running command (like the dev server) | **Ctrl + C** |
| Clear the screen | **Cmd + K** (or type `clear`) |
| Leave a stuck screen (`git diff`, `git log`) | **q** |
| Stuck in a text editor after a merge | type `:wq` then **Enter** |

---

## 8. Working on a branch (when you want to try something without touching `main`)

```bash
git switch -c my-experiment      # make a new branch and move onto it
# ...work, then add / commit as normal...
git push -u origin my-experiment # first push of a new branch
git switch main                  # go back to main
```
Vercel builds a separate preview link for each branch. Only pushes to `main` change the live site.

---

## 9. Rules of thumb
- **`git status` before `git add -A`**, every time. It's the one habit that prevents most mistakes.
- Commit small and often; a clear headline beats a long one.
- `git pull --no-rebase` first if you worked on GitHub's website (merged a PR, edited a file there).
- If a command prints something scary and you don't understand it, don't retry it: copy the whole output and ask.
