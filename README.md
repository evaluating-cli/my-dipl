# Diplomacy — 1901 Board Game

A web-based implementation of the classic strategy board game **Diplomacy**, built with React, TypeScript, and Tailwind CSS.

## Features

- **Direct Map Interaction**: Select any of your units on the map to automatically highlight all legal move destinations. Click a neighbouring province to immediately issue a move order (no need to navigate through the side panel).
- **Unit Command Controls**:
  - **Move**: Click your unit, then click any neighbouring province (or enemy unit).
  - **Hold**: Click your selected unit or its own province tile to command it to hold.
  - **Support**: Click Support in the order panel and click a neighbouring unit/province to reinforce it.
- **Visual Order Feedback**: Real-time animated movement arrows, support links, support strength badges, and highlighted province borders.
- **Full 1901 Ruleset**: Handles Spring/Fall movement phases, winter supply center adjudication, home center builds, disbands, and win conditions.
