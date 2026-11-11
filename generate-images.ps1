$ErrorActionPreference = 'Continue'
$outDir = "C:\Users\User\OneDrive\Desktop\Empanadas\img\empanadas"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$masaMap = @{
  'clasica'  = 'golden wheat flour dough'
  'integral' = 'whole wheat dough with a rustic look'
  'maiz'     = 'corn dough (masa de maíz) with a warm yellow color'
}
$rellenoMap = @{
  'carne'    = 'filled with seasoned beef, visible through a small cut'
  'pollo'    = 'filled with shredded chicken, visible through a small cut'
  'queso'    = 'filled with melted cheese stretching out'
  'verduras' = 'filled with colorful vegetables like peppers, onion and spinach'
}
$coccionMap = @{
  'horno'  = 'baked in the oven, lightly browned and matte'
  'frita'  = 'fried until crispy and deep golden with a slight sheen'
}
$repulgueMap = @{
  'tradicional' = 'classic braided crimped edge (repulgue tradicional)'
  'corazones'   = 'crimped edge shaped with small heart patterns'
  'estrellas'   = 'crimped edge shaped with small star patterns'
}

$combos = @()
foreach ($m in $masaMap.Keys) {
  foreach ($r in $rellenoMap.Keys) {
    foreach ($c in $coccionMap.Keys) {
      foreach ($p in $repulgueMap.Keys) {
        $combos += [pscustomobject]@{m=$m;r=$r;c=$c;p=$p}
      }
    }
  }
}

$i = 0
foreach ($k in $combos) {
  $i++
  $name = "$($k.m)__$($k.r)__$($k.c)__$($k.p).jpg"
  $path = Join-Path $outDir $name
  if (Test-Path $path) {
    $len = (Get-Item $path).Length
    if ($len -gt 10000) { Write-Output "SKIP $i/$($combos.Count) $name"; continue }
  }
  $prompt = "Ultra realistic food photography of a single delicious Argentine empanada on a ceramic plate, $($masaMap[$k.m]), $($rellenoMap[$k.r]), $($coccionMap[$k.c]), $($repulgueMap[$k.p]), appetizing, warm studio lighting, shallow depth of field, wooden table background, high detail, professional food photo"
  $seed = 1000 + $i
  $url = "https://image.pollinations.ai/prompt/$([uri]::EscapeDataString($prompt))?width=768&height=768&seed=$seed&model=flux&nologo=true"
  $ok = $false
  for ($t=1; $t -le 2; $t++) {
    try {
      Invoke-WebRequest -Uri $url -OutFile $path -UseBasicParsing -TimeoutSec 180
      $len = (Get-Item $path).Length
      if ($len -gt 10000) { Write-Output "OK   $i/$($combos.Count) $name ($len)"; $ok = $true; break }
      else { Write-Output "SMALL $i/$($combos.Count) $name ($len) try $t" }
    } catch {
      Write-Output "ERR  $i/$($combos.Count) $name try $t : $($_.Exception.Message)"
    }
    Start-Sleep -Seconds 2
  }
  if (-not $ok) { Write-Output "FAIL $i/$($combos.Count) $name" }
  Start-Sleep -Milliseconds 500
}
Write-Output "DONE"