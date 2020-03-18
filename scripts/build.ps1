Set-PSDebug -Trace 1
del native\index.node
npm run dist
npm run build:v3
cp package.json package-lock.json dist
pushd dist; npm link; popd
pwd

Get-ChildItem ".\examples" -Directory | ForEach-Object {
  if ($_.Name -ne "v3") {
    Write-Output "Running examples in $($_.Name)"
    pushd $_.FullName
    npm link @pact-foundation/pact
    npm i
    npm t
    if ($LastExitCode -ne 0) { $host.SetShouldExit($LastExitCode)  }
    popd
  }
}

Write-Output "Done with E2E tests"

Get-ChildItem ".\examples\v3" -Directory | ForEach-Object {
  Write-Output "Running V3 examples in $($_.Name)"
  pushd $_.FullName
  npm i
  del node_modules\@pact-foundation\pact\native\index.node
  npm link @pact-foundation/pact
  dir node_modules
  dir node_modules/@pact-foundation
  dir node_modules/@pact-foundation/pact
  dir node_modules/@pact-foundation/pact/native
  npm t
  if ($LastExitCode -ne 0) { $host.SetShouldExit($LastExitCode)  }
  popd
}

Write-Output "Done with V3 E2E tests"
