Set-PSDebug -Trace 1
dir env:

if ($env:APPVEYOR_REPO_TAG -eq "true") {
  Write-Output "Running deploy (APPVEYOR_REPO_TAG) is $env:APPVEYOR_REPO_TAG"
  npm install node-pre-gyp node-pre-gyp-github
  npm run build:v3
  Remove-Item 'native\target' -Recurse -Force
  npm run upload-binary
} else {
  Write-Output "Skipping deploy (APPVEYOR_REPO_TAG) is $env:APPVEYOR_REPO_TAG"
}
