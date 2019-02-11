// This is your message handler function.
// It expects to receive a valid "dog" object
// and returns a failed promise if not
export function dogApiHandler(dog: any): void {
  if (!dog.id && !dog.name && !dog.type) {
    throw new Error("missing fields")
  }

  // do some other things to dog...
  // e.g. dogRepository.save(dog)
  return
}
