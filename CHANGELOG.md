# Change Log

All notable changes to the "LEGv8 Assembly" extension will be documented in this file.

## 1.1.2

- Removed REPL command from startup.

## 1.1.1

- Removed uneccessary configuration settings.
- Added configuration setting for simulation memory size.

## 1.1.0

- Debugger support.
  - Step, step in, step out.
  - Continue.
  - Breakpoints.
  - Edit and view registers or memory during runtime.
  - Reverse debugging is not supported. Clicking those will act as normal debugging.
- Stack overflow detection.

## 1.0.4

- Fixed support for HALT, which currently does the same as DUMP.
- Added `PRNT reg`, where `reg` is a register to be printed.
- Fixed bug with memory not being set or read correctly.

## 1.0.1 - 1.0.3

- Fixed VSCode publishing issues.

## 1.0.0

- Initial release
