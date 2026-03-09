[![NPM version](https://img.shields.io/npm/v/cpupro.svg)](https://www.npmjs.com/package/cpupro)

# CPUpro

Rethinking of CPU profile analysis and processing. Focused on profiles and logs of any size collected in V8 runtimes: Node.js, Deno and Chromium browsers.

Supported formats:

* [V8 log](https://v8.dev/docs/profile) (.log)
* [V8 log preprocessed](https://v8.dev/docs/profile#web-ui-for---prof) with --preprocess (.json)
* [V8 CPU profile](https://nodejs.org/docs/latest/api/cli.html#--cpu-prof) (.cpuprofile)
* [Chromium Performance Profile](https://developer.chrome.com/docs/devtools/performance/reference#save) (.json)
* [Edge Enhanced Performance Traces](https://learn.microsoft.com/en-us/microsoft-edge/devtools-guide-chromium/experimental-features/share-traces) (.devtools)

> The file extension can be arbitrary; the format is determined based on the file's content.  
> The file content may be compressed using `gzip` or `deflate`.

## Usage

### Scenario #1 – A viewer for CPU profiles

Head to the [viewer on GitHub pages](https://discoveryjs.github.io/cpupro/), open a file in one of supported formats or drop it on the page.

<img width="1267" alt="Demo" src="https://github.com/lahmatiy/cpupro/assets/270491/ea4d54b7-8d37-456a-8db3-628a1da7df3e">

### Scenario #2 – CLI

CLI allows to generate a report (an viewer with embedded data) from a profile file.

To use CLI install `cpupro` globally using `npm install -g cpupro`, or use `npx cpupro`.

- open viewer without embedded data in default browser:
  ```
  cpupro
  ```
- open viewer with `test.cpuprofile` data embedded:
  ```
  cpupro test.cpuprofile
  ```
- open viewer with data embedded from `stdin`:
  ```
  cpupro - <test.cpuprofile
  ```
  ```
  cat test.cpuprofile | cpupro -
  ```
- get usage information:
  ```
  cpupro -h
  ```
  ```
  Usage:
  
      cpupro [filepath] [options]
  
  Options:
  
      -f, --filename <filename>    Specify a filename for a report; should ends with .htm or .html,
                                   otherwise .html will be added
      -h, --help                   Output usage information
      -n, --no-open                Prevent open a report in browser, the report will be written to file
      -o, --output-dir <path>      Specify an output path for a report (current working dir by default)
      -v, --version                Output version
  ```


## License

MIT
