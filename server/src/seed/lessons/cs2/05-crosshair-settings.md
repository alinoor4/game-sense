---
{
  "section": "Config & Practice",
  "title": "Crosshair Settings",
  "summary": "Set up a small, static crosshair with console commands that stays visible on every map, then stop changing it.",
  "difficulty": "beginner",
  "skill": "setup",
  "demo": "",
  "drills": []
}
---
## Why it matters

Your crosshair is the one thing on screen you look at all the time. If it is too big, it hides a distant head. If it blends into the wall behind it, you lose track of it at the moment that matters.

A good crosshair is small, easy to see and always the same. Once it is set, your eyes learn where its centre is, and you can stop thinking about it.

## How to do it

1. **Keep it small.** It should be small enough not to hide a distant head.
2. **Make it visible everywhere.** It must stand out on every background. Choose a colour that stands out on your maps; bright green and cyan are common.
3. **Use a static crosshair.** A static crosshair does not expand when you move, so its size is always the same.
4. **Set it with console commands.** Open the console and paste a block like the example below. Each line sets one part of the crosshair.
5. **Leave it alone.** Do not change it every week. Your eyes learn where its centre is, and every change makes them learn it again.

```
cl_crosshairstyle 4
cl_crosshairsize 2
cl_crosshairthickness 1
cl_crosshairgap -2
cl_crosshairdot 0
cl_crosshair_drawoutline 1
cl_crosshaircolor 1
```

## Common mistakes

- A large crosshair that covers the head at long range.
- A colour that disappears against some walls on your maps.
- A crosshair that grows while you move, so its size keeps changing.
- Copying a new crosshair every week.

## Practice

Open the Crosshair Generator in the Tools menu, which produces these commands from sliders. Start close to the example above, keep it small and pick a colour that stands out. Paste the commands it gives you into the console, then load each map you play and check the crosshair against bright and dark walls. Once it is visible everywhere, keep it unchanged.
