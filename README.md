LEGv8 Assembly Extension for Visual Studio Code
======

This is a LEGv8 Assembly extension for Visual Studio Code. This extension provides some basic functionality, including, but not limited to: syntax highlighting, autocomplete options, and the ability to simulate a small environment for the assembly to run. 

LEGv8 itself is a subset of the ARM assembly architecture. LEG is not used in real applications- it is used merely to be a teaching tool to help make the learning process easier in regards to assembly. The goal of this repository, and this extension, is to help in those efforts to those who are interested in learning assembly.

---

## Table of Contents

  - [Features](#features)
  - [Known Issues](#known-issues)
  - [Release Notes](#release-notes)
  - [References](#references)

---

## Features

The LEGv8 Assembly extension has the following features:
* Syntax highlighting.
* Autocomplete/autofill options for all of the implemented instructions.
* A mock debugger that will run through and evaluate the assembly code.
* Ability to configure the simulation within settings.

To see a list of all instructions and features implemented within the simulation, check out the wiki tab.

## Known Issues

Many things from LEG have not been fully implemented or tested. Those things are as follows:
* Overflow and carry flag setting/comparisons
* Floating point instructions
* Arithmetic instructions

If you find any new issues, please create an issue for them on the [Github repository](https://github.com/mtalyat/LEGv8-Assembly-VSCode-Extension).

## Release Notes

### 1.1.2

- Removed REPL command from startup.

### 1.1.1

- Removed uneccessary configuration settings.
- Added configuration setting for simulation memory size.

### 1.1.0

- Debugger support.
  - Step, step in, step out.
  - Continue.
  - Breakpoints.
  - Edit and view registers or memory during runtime.
  - Reverse debugging is not supported. Clicking those will act as normal debugging.
  - Use the Run menu item to see all available commands with the debugger.
- Stack overflow detection.

### 1.0.1

- Fixed support for HALT, which currently does the same as DUMP.
- Added `PRNT reg`, where `reg` is a register to be printed.
- Fixed bug with memory not being set or read correctly.

### 1.0.0

- Initial release

## References

The following is a list of useful references that were used for the understanding of LEG Assembly, as well as the creation of this extension:

* [LEGv8 Reference Data Cheat Sheet](https://www.usna.edu/Users/cs/lmcdowel/courses/ic220/S20/resources/ARM-v8-Quick-Reference-Guide.pdf)
* [Computer Organization and Design: The Hardware/Software Interface, ARM® Edition](https://www.amazon.com/Computer-Organization-Design-ARM-Architecture-ebook/dp/B01H1DCRRC)

---
