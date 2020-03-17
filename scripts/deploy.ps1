if ($APPVEYOR_REPO_TAG -eq 'true') {
  Write-Output "Running deploy (APPVEYOR_REPO_TAG) is true"
  npm run upload-binary
} else {
  Write-Output "Skipping deploy (APPVEYOR_REPO_TAG) is false"
}
