$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$taskNode = Get-Command node -ErrorAction SilentlyContinue
if (-not $taskNode) {
    $taskRuntime = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin'
    if (-not (Test-Path -LiteralPath (Join-Path $taskRuntime 'node.exe'))) {
        throw 'Node.js is required. Install Node.js 22 LTS, then run npm install.'
    }
    $env:PATH = $taskRuntime + ';' + $env:PATH
}
if (-not (Test-Path -LiteralPath 'node_modules\vite\bin\vite.js')) {
    throw 'Dependencies are missing. Run npm install first.'
}
Write-Host 'FSI Cloud & AX Coach: http://127.0.0.1:5173'
Write-Host 'Keep this window open. Press Ctrl+C to stop.'
& node node_modules/vite/bin/vite.js --host 127.0.0.1
