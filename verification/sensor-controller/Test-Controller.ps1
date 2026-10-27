$ErrorActionPreference = 'Stop'
$env:Path = 'C:\msys64\ucrt64\bin;' + $env:Path
Push-Location $PSScriptRoot
try {
    & g++ -std=c++17 -Wall -Wextra -Werror -I . test_controller.cpp -o test_controller.exe
    if ($LASTEXITCODE -ne 0) { throw 'Combined firmware host compile failed.' }
    & 'C:\Users\Arc\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' 'test-controller.cjs'
    if ($LASTEXITCODE -ne 0) { throw 'Combined firmware host tests failed.' }
} finally { Pop-Location }
