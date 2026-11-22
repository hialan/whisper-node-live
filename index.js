const fs = require("node:fs");
const path = require("node:path");
const { promisify } = require("node:util");
const { whisper } = require("./build/Release/addon.node");

const defaultPaths = {
  model: path.join(__dirname, "cpp/whisper.cpp/models/ggml-base.en.bin"),
  fname_inp: path.join(__dirname, "cpp/whisper.cpp/samples/jfk.wav"),
};

const whisperAsync = promisify(whisper);

const whisperParams = {
  language: "en",
  ...defaultPaths,
  use_gpu: true,
  flash_attn: false,
  no_prints: true,
  comma_in_time: false,
  no_timestamps: false,
  detect_language: false,
  audio_ctx: 0,
  max_len: 0,
  progress_callback: (progress) => {
    console.log(`progress: ${progress}%`);
  },
};

const booleanParameters = new Set([
  "use_gpu",
  "flash_attn",
  "no_prints",
  "comma_in_time",
  "no_timestamps",
  "detect_language",
]);
const integerParameters = new Set(["audio_ctx", "max_len"]);
const stringParameters = new Set(["language", "model", "fname_inp"]);

function parseArguments(args) {
  for (const arg of args) {
    if (!arg.startsWith("--")) {
      throw new Error(`Unexpected argument: ${arg}`);
    }

    const separator = arg.indexOf("=");
    if (separator === -1) {
      throw new Error(`Expected --name=value, got: ${arg}`);
    }

    const name = arg.slice(2, separator);
    const value = arg.slice(separator + 1);

    if (booleanParameters.has(name)) {
      if (value !== "true" && value !== "false") {
        throw new Error(`Expected true or false for --${name}`);
      }
      whisperParams[name] = value === "true";
    } else if (integerParameters.has(name)) {
      const number = Number(value);
      if (!Number.isInteger(number)) {
        throw new Error(`Expected an integer for --${name}`);
      }
      whisperParams[name] = number;
    } else if (stringParameters.has(name)) {
      whisperParams[name] = value;
    } else {
      throw new Error(`Unknown parameter: --${name}`);
    }
  }
}

async function main() {
  parseArguments(process.argv.slice(2));

  for (const name of ["model", "fname_inp"]) {
    if (!fs.existsSync(whisperParams[name])) {
      throw new Error(`File not found for ${name}: ${whisperParams[name]}`);
    }
  }

  console.log("whisperParams =", whisperParams);
  const result = await whisperAsync(whisperParams);
  console.log();
  console.log(result);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { whisper, defaultPaths };
