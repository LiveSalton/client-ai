# Basic Architecture Example

This example is a runnable reference for the Architecture plugin. It represents
a small order platform with four hand-authored artifacts:

- `system-context.structurizr.dsl`: C4 system context and container source.
- `dependency-impact.dot`: dependency impact graph source.
- `business-flow.mmd`: Markdown-native business flow source.
- `architecture-model.json`: evidence-backed architecture model.
- `architecture-understanding.md`: reading guide and assumptions.

The example is intentionally small. It demonstrates the artifact shapes that an
agent may write after inspecting a user project; it is not a reusable product
extractor or a language-specific analysis pipeline.

Run the smoke test with:

```bash
npm run validate:examples
```
