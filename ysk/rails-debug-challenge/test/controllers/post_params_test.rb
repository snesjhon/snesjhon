# frozen_string_literal: true
# typed: true

require 'minitest/autorun'
require 'sorbet-runtime'

# Mimics ActionController::Parameters#require + #permit
class FakeParams
  extend T::Sig

  sig { params(hash: T::Hash[T.untyped, T.untyped]).void }
  def initialize(hash)
    @hash = hash
  end

  sig { params(key: Symbol).returns(FakeParams) }
  def require(key)
    FakeParams.new(@hash.fetch(key, {}))
  end

  sig { params(keys: Symbol).returns(T::Hash[String, T.untyped]) }
  def permit(*keys)
    @hash.select { |k, _| keys.map(&:to_s).include?(k.to_s) }
  end
end

# Minimal controller stub — just enough to call post_params
class PostParamsTestController
  extend T::Sig

  sig { returns(FakeParams) }
  attr_reader :params

  sig { params(raw_params: T::Hash[T.untyped, T.untyped]).void }
  def initialize(raw_params)
    @params = FakeParams.new(raw_params)
  end

  private

  # Return type is now explicit — callers know exactly what they get
  sig { returns(T::Hash[String, T.untyped]) }
  def post_params
    params.require(:post).permit(:tittle, :body, :excerpt, :published)
    #                                ^^^ bug lives here — fix it when you're ready
  end
end

# ── Tests ─────────────────────────────────────────────────────────────────────

class PostParamsTest < Minitest::Test
  def setup
    raw = { post: { 'title' => 'Hello World', 'body' => 'Some content' } }
    @controller = PostParamsTestController.new(raw)
  end

  def test_title_is_permitted
    @controller.send(:post_params)

    # TODO: assert that "title" is present in permitted params
    # Hint: permitted is a T::Hash[String, T.untyped]
  end
end
