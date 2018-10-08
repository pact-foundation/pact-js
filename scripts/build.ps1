npm run dist

if ("$env:nodejs_version" -match "^(6|7|8|9)|[1-9][0-9]+(\.)?.*") {
  cd c:\pact-js
  Get-ChildItem ".\examples" -Directory | ForEach-Object {
    echo "Running examples in $($_.FullName)"
    cd $_.FullName
    npm i
    npm t
    if ($LastExitCode -ne 0) { $host.SetShouldExit($LastExitCode)  }
  }
} else {
  echo "Skipping examples for older node versions"
}