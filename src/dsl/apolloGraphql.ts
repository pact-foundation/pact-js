import { GraphQLInteraction } from "./graphql"

export class ApolloGraphQLInteraction extends GraphQLInteraction {
  constructor() {
    super()
    this.variables = this.variables || {}
    this.operation = this.operation || null
  }
}
