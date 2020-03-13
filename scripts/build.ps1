npm run dist
npm link
npm run build:v3

Get-ChildItem ".\examples" -Directory | ForEach-Object {
  Write-Output "Running examples in $($_.FullName)"
  cd $_.FullName
  npm link @pact-foundation/pact
  npm i
  npm t
  if ($LastExitCode -ne 0) { $host.SetShouldExit($LastExitCode)  }
}
