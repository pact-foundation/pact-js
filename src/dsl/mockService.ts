// Control how the Pact files are written
//  - overwrite: Recreates the target pact file after each run of Pact,
//               clobbering any existing pacts if present.
//  - merge:     Tells Pact that it will merge in new interactions to an
//               existing file, to allow multiple test files to be run in parallel.
//               This mode is really only useful if you need to split tests for a
//               single consumer-provider pair, across multiple test files.
//               You should delete any existing pacts before running the tests
//               so that interactions deleted from the code are not maintained in the file
//  - update:    Appends or updates interactions in a pact file. If an interaction
//               exists in the file, it is updated.
export type PactfileWriteMode = 'overwrite' | 'update' | 'merge';

export interface Pacticipant {
  name: string;
}

export interface PactDetails {
  consumer?: Pacticipant;
  provider?: Pacticipant;
  pactfile_write_mode: PactfileWriteMode;
}

export interface MockService {
  pactDetails: PactDetails;
  baseUrl: string;
}
