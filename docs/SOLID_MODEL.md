# Solid model

The browser owns all runtime state; there is no server or remote data loading.
The simulation is plain TypeScript. The UI bridge will publish scalar HUD snapshots
through batched signals. Canvas rendering never reads Solid primitives.

Components run once. Read reactive props in JSX; use `For` for identity-based lists
and `Show` or `Switch` for conditional panels. No routing or resources are needed.
The canvas callback ref captures the element. Setup belongs in `onMount`, and
observers, input listeners, and animation frames are disposed through `onCleanup`.
