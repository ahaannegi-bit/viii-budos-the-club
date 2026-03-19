# VIII BUDOS: The Club — Version 8

## Current State
Home, News, Leaderboard, Election, Work Board, Polls & Plans, Admin Panel all working. Leaderboard has 7 sample slots. Work Board requires login to view. No Games section exists.

## Requested Changes (Diff)

### Add
- Games page with 5 games (login required to play): Chess, Dots & Boxes, Battleship, Mental Maths Duel, Stickman Slap Duel
- Friend challenge system using existing backend challenge APIs
- Games nav link

### Modify
- Work Board: make publicly visible without login (posting still requires login)
- Leaderboard: add Member 8 as 8th slot; add "Top Score of Last Term" label

### Remove
- Nothing

## Implementation Plan
1. Update backend: make getAllWorkPosts and getWorkPostResponses public queries
2. Update useQueries.ts: use anonymous actor for work posts/responses
3. Update LeaderboardPage.tsx: add Member 8, add Top Score of Last Term label
4. Create GamesPage.tsx with 5 game components
5. Update NavBar.tsx: add Games link
6. Update App.tsx: add games page route
