type Package = {
  version: string
}

const pkg: Package = require("pkginfo")(module, "version")

export default pkg
