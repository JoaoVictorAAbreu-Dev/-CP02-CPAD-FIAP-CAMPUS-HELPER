$ErrorActionPreference = "Stop"

function Get-AndroidSdkRoot {
  if ($env:ANDROID_HOME) { return $env:ANDROID_HOME }
  if ($env:ANDROID_SDK_ROOT) { return $env:ANDROID_SDK_ROOT }

  $defaultSdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
  if (Test-Path $defaultSdk) { return $defaultSdk }

  throw "Android SDK nao encontrado. Defina ANDROID_HOME ou ANDROID_SDK_ROOT."
}

function Get-RunningEmulatorSerial {
  $lines = & $script:AdbPath devices | Select-Object -Skip 1
  foreach ($line in $lines) {
    if ($line -match "^(emulator-\d+)\s+device$") {
      return $matches[1]
    }
  }

  return $null
}

function Wait-ForEmulatorBoot {
  param(
    [string]$Serial,
    [int]$TimeoutSeconds = 180
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  while ((Get-Date) -lt $deadline) {
    $bootCompleted = (& $script:AdbPath -s $Serial shell getprop sys.boot_completed 2>$null).Trim()
    if ($bootCompleted -eq "1") {
      return
    }

    Start-Sleep -Seconds 3
  }

  throw "O emulador iniciou, mas nao terminou o boot em ate $TimeoutSeconds segundos."
}

$sdkRoot = Get-AndroidSdkRoot
$script:AdbPath = Join-Path $sdkRoot "platform-tools\adb.exe"
$emulatorPath = Join-Path $sdkRoot "emulator\emulator.exe"

if (-not (Test-Path $script:AdbPath)) {
  throw "adb.exe nao encontrado em $script:AdbPath"
}

if (-not (Test-Path $emulatorPath)) {
  throw "emulator.exe nao encontrado em $emulatorPath"
}

$runningSerial = Get-RunningEmulatorSerial

if (-not $runningSerial) {
  $avds = & $emulatorPath -list-avds
  if (-not $avds) {
    throw "Nenhum AVD encontrado. Crie um emulador no Android Studio primeiro."
  }

  $preferredAvd = $env:ANDROID_AVD
  if ($preferredAvd -and ($avds -notcontains $preferredAvd)) {
    throw "O AVD definido em ANDROID_AVD ('$preferredAvd') nao existe."
  }

  $selectedAvd = if ($preferredAvd) { $preferredAvd } else { $avds[0] }

  Write-Host "Iniciando emulador '$selectedAvd'..."
  Start-Process -FilePath $emulatorPath -ArgumentList @("-avd", $selectedAvd)

  Write-Host "Aguardando dispositivo ficar disponivel no adb..."
  & $script:AdbPath wait-for-device | Out-Null

  $runningSerial = $null
  $deadline = (Get-Date).AddSeconds(60)
  while ((Get-Date) -lt $deadline -and -not $runningSerial) {
    $runningSerial = Get-RunningEmulatorSerial
    if (-not $runningSerial) {
      Start-Sleep -Seconds 2
    }
  }

  if (-not $runningSerial) {
    throw "O emulador foi aberto, mas nao apareceu como 'device' no adb."
  }

  Write-Host "Aguardando Android concluir o boot..."
  Wait-ForEmulatorBoot -Serial $runningSerial
} else {
  Write-Host "Emulador ja esta em execucao ($runningSerial)."
}

Write-Host "Abrindo o app no Android via Expo..."
npx expo start --android
