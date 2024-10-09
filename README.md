# Summary

## Overview(original module)

This project is a refactor of a TypeScript module that handles token swaps between Cardano and Tron wallets.

The original module was designed to:

- Facilitate swaps of tokens such as ADA, MyUSD, USDT, and USDC.

- Integrate with the Cardano and Tron blockchain networks.

- Provide a user-friendly experience for executing token swaps through wallet integration.

- Communicate with back-end APIs for constructing, signing, and submitting transactions.

### Original Functionality

#### Swap Handling

The module allows users to swap tokens between Cardano and Tron blockchain networks.

The supported swaps include:

- ADA to MyUSD

- MyUSD to ADA

- MyUSD to USDT or USDC, and vice versa.

#### Wallet Integration

Cardano: Uses mynth-use-cardano to interact with the Cardano network.

Tron: Uses tronweb for Tron wallet interaction.

#### Transaction Building and Signing

Cardano transactions involve building UTXOs, interacting with Lucid, and signing the transaction.

TronLink transactions involve building, signing, and submitting using TronWeb APIs.

#### Error Handling and Modals

The original code includes error handling with informative modals for different stages of the transaction process (e.g., "failed", "generating", "building").

## Refactoring Changes

### Separation of Concerns

The original module had a lot of logic packed into a single hook (useHandleSwap).

In the refactor, we have:

- Separation of Cardano and TronLink logic into cardanoSwapHandler.ts and tronSwapHandler.ts files.

- Service layer for handling API calls in swapService.ts.

### TypeScript Improvements

#### Type Safety

Introduced more robust type definitions in types.ts, including enum types for blockchain names and token symbols.

#### Reduced Hardcoding

Blockchain and token types are now defined in the types.ts file, eliminating hardcoded strings throughout the module.

### Improved Readability and Maintainability

Refactored long and nested conditionals into smaller, modular functions.

Introduced better naming conventions for variables and functions, improving the clarity of the code.

### Error Handling

Centralized error handling in useHandleApiErrors.ts, reducing duplicate code and ensuring consistent error responses.

Improved error messaging to provide more informative feedback to the user during swap processes.

### Testing

Introduced unit tests for the refactored cardanoSwapHandler and tronSwapHandler using Jest.

Added tests to ensure error handling, transaction building, and API interactions work as expected.

## Setup Instructions

### Prerequisites

Make sure you have Node.js and npm, yarn installed.

### Clone the Repository

### Install Dependencies

yarn install

### Set up Environment Variables

Create a .env file in the root directory with the following values:

- BACKEND_URI=https://your-backend-url.com

- TRON_USDT_CONTRACT_ADDRESS=...

- TRON_USDC_CONTRACT_ADDRESS=...

- TRON_USDT_DESTINATION=...

- TRON_USDC_DESTINATION=...

### Run Tests

yarn test

### Build the Project

yarn run build

## Refactoring Summary

### Challenges Encountered

#### Modularizing Swap Logic

Splitting the swap logic into separate Cardano and Tron handlers without breaking existing functionality required careful separation of concerns.

#### Error Handling

Ensuring consistent error handling across multiple blockchain integrations was a challenge, which was mitigated by centralizing the error handling logic.
