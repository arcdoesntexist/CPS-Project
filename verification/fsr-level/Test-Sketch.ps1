$ErrorActionPreference = 'Stop'
$env:Path = 'C:\msys64\ucrt64\bin;' + $env:Path
Push-Location $PSScriptRoot
try {
    & g++ -std=c++17 -Wall -Wextra -Werror -I . test_sketch.cpp -o test_sketch.exe
    if ($LASTEXITCODE -ne 0) { throw 'Host compilation failed.' }
    $failed = 0
    foreach ($case in 'released', 'pressed', 'midpoint', 'independent', 'clamp-low', 'clamp-high', 'transition', 'rollover') {
        & '.\test_sketch.exe' $case
        if ($LASTEXITCODE -ne 0) { $failed++ }
    }
    if ($failed) { throw "$failed FSR cases failed." }
    Write-Output '8/8 FSR host tests passed.'
} finally {
    Pop-Location
}
