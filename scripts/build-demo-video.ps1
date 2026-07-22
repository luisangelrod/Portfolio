param(
  [string]$OutputPath = "submission-assets/ProofLoop-Build-Week-Demo.mp4"
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$assetRoot = Join-Path $repoRoot "submission-assets"
$buildRoot = Join-Path $assetRoot "video-build"
$ffmpeg = "C:\Users\lrodriguez\Documents\Codex\2026-07-21\what\video-tools\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
$resolvedOutput = Join-Path $repoRoot $OutputPath

if (-not (Test-Path -LiteralPath $ffmpeg)) {
  throw "FFmpeg was not found at $ffmpeg"
}

New-Item -ItemType Directory -Force -Path $buildRoot | Out-Null
Add-Type -AssemblyName System.Speech

$scenes = @(
  @{
    Image = "01-hero.png"
    Text = "Coding agents can produce plausible code quickly. ProofLoop answers the harder production question: what evidence should that code earn before a human accepts it? It adds four independent review gates, a bounded correction plan, regression evidence, and a final decision that only a person can make."
  },
  @{
    Image = "05-skill-github.png"
    Text = "The real workflow is a repository-scoped Codex skill. From this repository, I invoke proofloop review on a diff, failure report, or implementation. Codex with GPT five point six inspects the smallest relevant surface, runs proportionate checks, cites repository evidence, and labels every important claim as observed, executed, proposed, or unknown."
  },
  @{
    Image = "02-run.png"
    Text = "The public project gives judges a zero-setup path. This payment example separates network success from business approval. The judge demo loads clearly labeled curated evidence and applies domain, security, product, and test perspectives. It never presents a canned result as a live model response."
  },
  @{
    Image = "03-decision.png"
    Text = "Findings become the smallest safe correction, a regression plan, and concrete human checks. Proposed tests remain visibly different from checks that actually ran. Gate five is intentionally locked until a person decides. Here, the reviewer rejects the change because a declined payment could still be persisted as completed."
  },
  @{
    Image = "04-handoff.png"
    Text = "The Codex handoff copies a complete prompt for the checked-in skill and explicitly says no model call happened in the browser. The actual GPT five point six review runs in Codex through Sign in with ChatGPT, so this project uses my subscription without extracting OAuth credentials or requiring a pay-per-use API key."
  },
  @{
    Image = "01-hero.png"
    Text = "I used Codex with GPT five point six to extend an earlier portfolio concept into this working developer tool during Build Week: the reusable skill, redesigned interface, validation tests, accessibility behavior, deployment, and documentation. ProofLoop makes agent-written code earn acceptance."
  }
)

$segmentFiles = @()
for ($index = 0; $index -lt $scenes.Count; $index++) {
  $number = "{0:D2}" -f ($index + 1)
  $audioPath = Join-Path $buildRoot "scene-$number.wav"
  $segmentPath = Join-Path $buildRoot "scene-$number.mp4"
  $imagePath = Join-Path $assetRoot $scenes[$index].Image

  if (-not (Test-Path -LiteralPath $imagePath)) {
    throw "Missing scene image: $imagePath"
  }

  $voice = [System.Speech.Synthesis.SpeechSynthesizer]::new()
  try {
    $voice.SelectVoice("Microsoft Zira Desktop")
    $voice.Rate = 0
    $voice.Volume = 100
    $voice.SetOutputToWaveFile($audioPath)
    $voice.Speak($scenes[$index].Text)
  }
  finally {
    $voice.Dispose()
  }

  & $ffmpeg -hide_banner -loglevel error -y `
    -loop 1 -i $imagePath -i $audioPath `
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x07050d,format=yuv420p" `
    -r 30 -c:v libx264 -preset medium -crf 19 `
    -c:a aac -b:a 192k -ar 48000 -ac 2 -shortest $segmentPath

  if ($LASTEXITCODE -ne 0) {
    throw "FFmpeg failed while rendering scene $number"
  }
  $segmentFiles += $segmentPath
}

$concatPath = Join-Path $buildRoot "segments.txt"
$concatLines = $segmentFiles | ForEach-Object { "file '$($_.Replace("'", "''"))'" }
Set-Content -LiteralPath $concatPath -Value $concatLines -Encoding utf8

& $ffmpeg -hide_banner -loglevel error -y `
  -f concat -safe 0 -i $concatPath -c copy -movflags +faststart $resolvedOutput

if ($LASTEXITCODE -ne 0) {
  throw "FFmpeg failed while joining the demo video"
}

Write-Output $resolvedOutput
