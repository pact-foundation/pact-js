npm ci
npm run dist
npm run build:v3
Copy-Item "package.json" -Destination "dist"
Copy-Item "package-lock.json" -Destination "dist"
Copy-Item -Path "native" -Destination "dist" -Recurse
pushd dist
npm link
popd

Push-Location dist
npm link
Pop-Location

Get-ChildItem ".\examples" -Directory | ForEach-Object {
  if ($_.Name -ne "v3") {
    Write-Output "Running examples in $($_.Name)"
    pushd $_.FullName
    npm i
    npm link @pact-foundation/pact
    npm t
    if ($LastExitCode -ne 0) {
      Write-Output "Non-zero exit code!"
      $host.SetShouldExit($LastExitCode)
    }
    popd
  }
}

Write-Output "Done with V2 tests"

Get-ChildItem ".\examples\v3" -Directory | ForEach-Object {
  Write-Output "Running V3 examples in $($_.Name)"
  pushd $_.FullName
  npm i
  Remove-Item -LiteralPath "node_modules\@pact-foundation\pact" -Force -Recurse

  npm link @pact-foundation/pact
  npm t
  if ($LastExitCode -ne 0) {
    Write-Output "Non-zero exit code!"
    $host.SetShouldExit($LastExitCode)
  }
  popd
}

Write-Output "Done with V3 tests"

Get-ChildItem ".\examples\v4" -Directory | ForEach-Object {
  Write-Output "Running V4 examples in $($_.Name)"
  pushd $_.FullName
  npm i
  Remove-Item -LiteralPath "node_modules\@pact-foundation\pact" -Force -Recurse

  npm link @pact-foundation/pact
  npm t
  if ($LastExitCode -ne 0) {
    Write-Output "Non-zero exit code!"
    $host.SetShouldExit($LastExitCode)
  }
  popd
}

Write-Output "Done with V4 tests"
