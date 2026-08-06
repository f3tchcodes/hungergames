# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Released]

## [1.0.0] - 2026-8-04

### Added

- `/host` command to host the game.
- `/start` command to start a game after hosting.
- `/next` command to continue gameplay after starting.
- `/stop` command to completely stop and delete the current game.
- `/usersettings` command to change user's own settings in the game such as gender and game name.
- `/viewcast` command to view registered players in the game.
- `/editcast` command to register and edit cast members.
- `/help` command to open a help menu.

## [1.0.1] - 2026-8-06

### Added

- `/restart` command to restart in the middle of a started game.

### Fixed

- Names with spaces are colored white if line breaks in the middle of an event.
- Fallen tributes profile pictures are not grayed out.
- Gender is always male by default.
- Interaction failed after running /next once the game ends.
- New game can be started in the middle of a started game.

### Removed

- `/editcast` command to register and edit cast members (to be added later).