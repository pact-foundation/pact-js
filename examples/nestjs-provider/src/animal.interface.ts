export interface Animal {
  id: number
  first_name: string
  last_name: string
  animal: string
  age: number
  available_from: Date
  gender: "M" | "F"
  location: {
    description: string
    country: string
    post_code: number
  }
  eligibility: {
    available: boolean
    previously_married: boolean
  }
  interests: string[]
}
