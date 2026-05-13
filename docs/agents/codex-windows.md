# Codex Windows Runtime Notes

Future agents should treat this file as the repo runbook for Codex shell-tool
behavior on this Windows workspace.

## Sandbox runner failure

Codex shell commands may fail before the command itself starts with an error
like:

```text
windows sandbox: runner error: CreateProcessAsUserW failed: 1312
```

This is a local Codex Windows sandbox-launch failure. It means the sandbox could
not start the process under its restricted user/session token. It does not mean
the repository, application, Git, Husky, npm, or PowerShell command is broken.

## Escalation policy

Default to the normal sandbox first.

If a necessary command fails with `CreateProcessAsUserW failed: 1312`, retry the
same command with `sandbox_permissions: require_escalated` and the narrowest
reasonable `prefix_rule`.

If the same session has already shown repeated `CreateProcessAsUserW failed:
1312` failures on basic read-only inspection commands, future similar read-only
inspection commands may start escalated for that session. Keep the escalation
narrow and name the sandbox-runner failure in the justification.

## Safe examples

Good escalation targets after this runner failure include:

- `Get-Content` for reading repo files.
- `Get-ChildItem` for listing repo files.
- `git status` or `git diff` for inspection.
- `bash .husky/pre-commit` when verifying the documented Git Bash hook path.

## Boundaries

Do not treat this as blanket permission to escalate everything.

- Do not escalate destructive commands because of this note.
- Do not use broad prefix rules such as `python`, `powershell`, or arbitrary
  shell launchers.
- Do not skip normal sandboxing on a fresh session unless the runner failure has
  already reproduced.
- Keep this runtime workaround distinct from `docs/agents/pre-commit.md`, which
  documents the GitHub Desktop/Git Bash Husky hook behavior.
