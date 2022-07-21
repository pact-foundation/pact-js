import { SpecificationVersion } from '../v3';

export const numberToSpec = (
  spec?: number,
  defaultSpec: SpecificationVersion = SpecificationVersion.SPECIFICATION_VERSION_V2
): SpecificationVersion => {
  if (!spec) {
    return defaultSpec;
  }

  switch (spec) {
    case 2:
      return SpecificationVersion.SPECIFICATION_VERSION_V2;
    case 3:
      return SpecificationVersion.SPECIFICATION_VERSION_V3;
    case 4:
      return SpecificationVersion.SPECIFICATION_VERSION_V4;
    default:
      throw new Error(`invalid pact specification version supplied: ${spec}`);
  }
};
