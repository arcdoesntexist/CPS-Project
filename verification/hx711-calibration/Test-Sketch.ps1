$ErrorActionPreference = 'Stop'
$env:Path = 'C:\msys64\ucrt64\bin;' + $env:Path
Push-Location $PSScriptRoot
try {
    & g++ -std=c++17 -Wall -Wextra -Werror -I . test_sketch.cpp -o test_sketch.exe
    if ($LASTEXITCODE -ne 0) { throw 'Host test compilation failed.' }
    $failed = 0
    foreach ($case in 'conversion', 'negative', 'missing', 'tare-dropout', 'recovery', 'commands', 'disconnect', 'retare-failure', 'read-dropout') {
        & '.\test_sketch.exe' $case
        if ($LASTEXITCODE -ne 0) { $failed++ }
    }
    if ($failed -ne 0) { throw "$failed host tests failed." }
    Write-Output '9/9 host tests passed.'
} finally {
    Pop-Location
}
