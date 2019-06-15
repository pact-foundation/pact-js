require 'pact/logging'

# Allow integers and floats to be equivalent types
module Pact
  module Matchers
    include Pact::Logging
    logger.info "Monkey patching Pact Ruby => Overriding number matching behaviour to treat integers and floats as equivalent types (see https://github.com/pact-foundation/pact-ruby/issues/191)"

    def types_match? expected, actual
      # See the following issues for background
      # * https://github.com/pact-foundation/pact-ruby/issues/191
      # * https://github.com/pact-foundation/pact-js/issues/123
      # * https://github.com/pact-foundation/pact-mock_service/issues/78
      expected.class == actual.class ||
        (is_boolean(expected) && is_boolean(actual)) ||
        (expected.is_a?(Float) && actual.is_a?(Fixnum)) ||
        (expected.is_a?(Fixnum) && actual.is_a?(Float))
    end
  end
end
