# frozen_string_literal: true
# typed: true

class PostMailer < ApplicationMailer
  extend T::Sig

  sig { params(comment: Comment).returns(Mail::Message) }
  def new_comment(comment)
    @comment = comment
    @post    = T.must(comment.post)

    mail(
      to: T.must(@post.user).email,
      subject: "New comment on \"#{@post.title}\""
    )
  end
end
