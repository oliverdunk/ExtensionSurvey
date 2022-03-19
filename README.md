# ExtensionSurvey

A small tool which downloads the top 1000 Add-ons from [AMO](https://addons.mozilla.org/) and summarises data including the WebExtension APIs they use and the size of the unpacked extenion.

## Usage

1. Run `npm install` to install the required dependencies.
1. Run `npm start` to begin collecting extensions.

## Metrics currently collected

- Extension name
- Extension slug
- Bundle size
- If WASM is used
- Referenced WebExtension APIs

## Disclaimer

This project is not associated with Mozilla in any way. Please be respectful of rate limits and other API usage rules before running.
