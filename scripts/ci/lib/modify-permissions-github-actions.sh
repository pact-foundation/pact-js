#!/bin/bash -eu

# This script is a workaround for Ruby complaining about world writeable directories
# and failing the tests because it writes to standard error.

echo "Reducing permissions on github actions' folders to avoid ruby warnings"
sudo chmod 755 -R /home
sudo chmod 755 -R /usr/share
sudo chmod 755 -R /opt