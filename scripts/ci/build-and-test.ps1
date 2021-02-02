npm ci
npm run dist

Push-Location dist
npm link
Pop-Location

Get-ChildItem ".\examples" -Directory | ForEach-Object {
  Write-Output "Running examples in $($_.FullName)"
  Set-Location $_.FullName
  npm i
  npm link @pact-foundation/pact
  npm t
  if ($LastExitCode -ne 0) { $host.SetShouldExit($LastExitCode)  }
}
