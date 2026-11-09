# Standards

Coding standards a linter can't check. Anything a tool can enforce (formatting, imports, strict types, no `any`) lives in the tool's config and runs in hooks and CI, not here.

## Error handling
- Never fail silently. Every error either reaches the user as a readable message or is rethrown with context.
- Domain functions return or throw typed errors; the UI decides how to show them.
- No empty `catch` blocks. A `catch` that deliberately ignores an error says why in a comment.

## Validation
- Validate input at the edge (form, URL, API boundary) before it reaches domain logic.
- Invalid input produces a visible message next to the field or filter that caused it, saying what is wrong and what is allowed.
- Every error case listed in a SPEC has a test.

## Logging
- Log at boundaries (requests, failures), not inside pure domain functions.
- Never log secrets or personal data.

## Tests
- Write and run a failing test before the code that makes it pass.
- Domain rules (totals, fees, validation) live in pure functions so they are unit-tested without the UI.
- End-to-end tests cover what a user sees, including at least one error path per feature.

## Review
- A human reads the whole diff and can explain every line before merging.
- The reviewer subagent checks a diff against its SPEC and these standards.
