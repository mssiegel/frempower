# Pre-Commit Workflow

Future agents should treat this file as the repo runbook for commit hooks and
formatter behavior.

## Current behavior

- `.husky/pre-commit` runs `npm run lint-staged --` before `npm run test`.
- `.lintstagedrc` runs `prettier --ignore-unknown --write` on staged files.
- `.prettierrc` owns the repo's Prettier defaults.
- `package.json` defines `lint-staged`, `test`, and `prepare` scripts for the
  hook workflow.
- `npm run test` runs workspace tests for both the client and server.

## Windows and GitHub Desktop

GitHub Desktop runs hooks through Git Bash on Windows. When Node.js is installed
under `C:/Program Files/nodejs`, direct `npx` calls or bare `npm` calls can fail
inside that shell because Bash may not launch Windows `.cmd` shims correctly.

For that reason, `.husky/pre-commit` routes npm commands through `cmd.exe` when
`cmd.exe` is available, and falls back to normal `npm` elsewhere. Preserve that
shape when editing the hook unless the Windows GitHub Desktop behavior has been
retested.

## Line endings

Husky hook files must keep LF line endings so Git Bash can execute them
reliably. `.gitattributes` owns this with:

```gitattributes
.husky/* text eol=lf
```

Do not remove that rule unless another hook line-ending policy replaces it.

## Verification

After changing hook, formatter, or package-script behavior, verify with:

```sh
bash .husky/pre-commit
```

Running only from PowerShell is not enough, because the failure mode this runbook
protects against happens in Git Bash/GitHub Desktop.
