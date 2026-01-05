export enum DogClassification {
  ThisFixedValue = 'ThisFixedValue',
}
export type Dog = {
  id: string;
  classification: DogClassification;
} & (
  | {
      fooIdentifier: string;
      barIdentifier?: never;
    }
  | {
      barIdentifier: string;
      fooIdentifier?: never;
    }
)
  & (
    | {
        fooVersion: number;
        barVersion?: never;
      }
    | {
        barVersion: number;
        fooVersion?: never;
      }
  );



// This is your message handler function.
// It expects to receive a valid "dog" object
// and returns a failed promise if not
export function dogApiHandler(dog: Dog): void {
  // if (!dog.id || !dog.classification ) {
  console.log(dog);
  if (!dog.id || !dog.classification || (dog.fooIdentifier && dog.barIdentifier) || (dog.barVersion && dog.fooVersion) || (!dog.fooIdentifier && !dog.barIdentifier) || (!dog.barVersion && !dog.fooVersion)) {
    throw new Error('missing fields');
  }

  // do some other things to dog...
  // e.g. dogRepository.save(dog)
  return;
}
