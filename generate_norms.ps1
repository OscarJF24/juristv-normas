# Simple generator for dummy norm data
$OutputDir = Join-Path -Path $PSScriptRoot -ChildPath 'dist'
if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null }

$laws = @(
    @{ Name = 'ley_1564_2012'; File = 'ley_1564_2012.json'; Dummy = 'Dummy content for Ley 1564 de 2012' }
    @{ Name = 'ley_0599_2000'; File = 'ley_0599_2000.json'; Dummy = 'Dummy content for Ley 0599 de 2000' }
    @{ Name = 'constitucion_1991'; File = 'constitucion_1991.json'; Dummy = 'Dummy content for Constitución 1991' }
)

$manifest = @()

foreach ($law in $laws) {
    Write-Host "Generating $($law.Name)..." -ForegroundColor Cyan
    $jsonObj = @{ source_url = "https://example.com/$($law.File)"; content = $law.Dummy } | ConvertTo-Json -Depth 5 -Compress
    $jsonPath = Join-Path $OutputDir $law.File
    Set-Content -Path $jsonPath -Value $jsonObj -Encoding UTF8
    $gzPath = "$jsonPath.gz"
    $bytes = [System.IO.File]::ReadAllBytes($jsonPath)
    $fs = [System.IO.File]::Create($gzPath)
    $gz = New-Object System.IO.Compression.GzipStream($fs, [System.IO.Compression.CompressionMode]::Compress)
    $gz.Write($bytes, 0, $bytes.Length)
    $gz.Close()
    $fs.Close()
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    $hashBytes = $sha256.ComputeHash([System.IO.File]::ReadAllBytes($gzPath))
    $hash = -join ($hashBytes | ForEach-Object { $_.ToString('x2') })
    $manifest += @{ archivo = [System.IO.Path]::GetFileName($gzPath); hash = $hash }
    Write-Host "Created $gzPath (sha256=$hash)" -ForegroundColor Green
}

$manifestObj = @{ normas = $manifest }
$manifestPath = Join-Path $PSScriptRoot 'manifest.json'
$manifestObj | ConvertTo-Json -Depth 5 -Compress | Set-Content -Path $manifestPath -Encoding UTF8
Write-Host "Manifest written to $manifestPath" -ForegroundColor Yellow
