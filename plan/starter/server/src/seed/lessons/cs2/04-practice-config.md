---
{
  "section": "Config & Practice",
  "title": "Practice Server Commands",
  "summary": "Copy-and-paste console commands that turn a private match into a practice range for sprays and grenades.",
  "difficulty": "beginner",
  "skill": "setup",
  "demo": "",
  "drills": [
    { "name": "Set up the practice server and throw each grenade type ten times", "tool": "In-game", "minutes": 15 }
  ]
}
---
## Why it matters

You cannot practise a spray or a smoke lineup properly in a live match: rounds end, money runs out and people shoot at you. A private server with a few console commands gives you unlimited time, money and ammunition, and shows you where your grenades will land.

## How to do it

1. In the game settings, turn on **Enable Developer Console**.
2. Start a **Practice** match on the map you want, on your own.
3. Open the console with `key:~` and paste the block below.

```
sv_cheats 1
mp_limitteams 0
mp_autoteambalance 0
mp_roundtime_defuse 60
mp_freezetime 0
mp_buytime 9999
mp_buy_anywhere 1
mp_maxmoney 60000
mp_startmoney 60000
sv_infinite_ammo 1
ammo_grenade_limit_total 5
sv_grenade_trajectory_prac_pipreview 1
sv_showimpacts 1
bot_kick
mp_warmup_end
mp_restartgame 1
```

What the important lines do:

| Command | Effect |
|---------|--------|
| `sv_cheats 1` | Allows the practice-only commands below |
| `mp_buy_anywhere 1` | Buy from anywhere on the map, at any time |
| `sv_infinite_ammo 1` | Never run out of bullets or grenades |
| `ammo_grenade_limit_total 5` | Carry one of every grenade type |
| `sv_grenade_trajectory_prac_pipreview 1` | Shows a preview of where the grenade will land |
| `sv_showimpacts 1` | Marks where your bullets hit, useful for spray practice |
| `bot_kick` | Removes the bots |

To fly around the map and check where a grenade landed, bind noclip to a key:

```
bind v noclip
```

## Common mistakes

- Pasting the commands in a matchmaking game. They only work on a server you host.
- Forgetting `sv_cheats 1`. Most of the other commands do nothing without it.
- Practising only with infinite ammo. Finish each session with a few normal magazines so reloading stays a habit.

## Practice

Set the server up, stand ten metres from a wall and spray one full rifle magazine. Look at the impact marks, then try to keep the next spray inside a smaller area. After that, pick one smoke for your favourite map and throw it until it lands in the same place five times in a row.
