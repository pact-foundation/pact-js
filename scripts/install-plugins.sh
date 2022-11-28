#!/bin/bash -e
#
# Usage:
#   $ curl -fsSL https://raw.githubusercontent.com/pact-foundation/pact-plugins/master/install-cli.sh | bash
# or
#   $ wget -q https://raw.githubusercontent.com/pact-foundation/pact-plugins/master/install-cli.sh -O- | bash
#

function detect_osarch() {
    case $(uname -sm) in
        'Linux x86_64')
            os='linux'
            arch='x86_64'
            ;;
        'Darwin x86' | 'Darwin x86_64')
            os='osx'
            arch='x86_64'
            ;;
        'Darwin arm64')
            os='osx'
            arch='aarch64'
            ;;
        CYGWIN*|MINGW32*|MSYS*|MINGW*)
            os="windows"
            arch='x86_64'
            ext='.exe'
            ;;
        *)
        echo "Sorry, you'll need to install the plugin CLI manually."
        exit 1
            ;;
    esac
}

VERSION=$(curl -s https://api.github.com/repos/pact-foundation/pact-plugins/releases | grep pact-plugin-cli | grep tag_name | head -n1 | egrep -o "[0-9\.]+")
detect_osarch

if [ ! -f ~/.pact/bin/pact-plugin-cli ]; then
    echo "--- 🐿  Installing plugins CLI version ${VERSION}"
    mkdir -p ~/.pact/bin
    curl -L -o ~/.pact/bin/pact-plugin-cli-${os}-${arch}.gz https://github.com/pact-foundation/pact-plugins/releases/download/pact-plugin-cli-v${VERSION}/pact-plugin-cli-${os}-${arch}${ext}.gz
    gunzip -N -f ~/.pact/bin/pact-plugin-cli-${os}-${arch}.gz
    chmod +x ~/.pact/bin/pact-plugin-cli
fi

if [ ! -d ~/.pact/plugins/matt-0.0.3 ]; then
    echo "--- 🐿  Installing MATT plugin"
  ~/.pact/bin/pact-plugin-cli -y -d install https://github.com/mefellows/pact-matt-plugin/releases/tag/v0.0.4
fi