if ($APPVEYOR_REPO_TAG -eq 'true') {
  Write-Output "Running deploy (APPVEYOR_REPO_TAG) is true"
} else {
  Write-Output "Skipping deploy (APPVEYOR_REPO_TAG) is false"
}
