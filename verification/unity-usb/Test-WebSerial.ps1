param([string]$NodePath = 'C:\Users\Arc\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe')
$ErrorActionPreference = 'Stop'
& $NodePath (Join-Path $PSScriptRoot 'web-serial.test.cjs')
if ($LASTEXITCODE -ne 0) { throw 'Web Serial bridge tests failed.' }
