# frozen_string_literal: true

# Run with: rails db:seed
# Resets and re-seeds the database with sample data for development.

puts 'Clearing existing data...'
Comment.destroy_all
Post.destroy_all
User.destroy_all

puts 'Creating users...'
alice = User.create!(name: 'Alice', email: 'alice@example.com', password: 'password')
bob   = User.create!(name: 'Bob',   email: 'bob@example.com',   password: 'password')

puts 'Creating posts...'
post1 = alice.posts.create!(title: 'Getting Started with Rails', body: 'Rails makes building web apps fast and fun. Here is how to get started...', status: 'published')
post2 = alice.posts.create!(title: 'Draft Post', body: 'This is a work in progress.', status: 'draft')
post3 = bob.posts.create!(title: "Bob's Guide to ActiveRecord", body: 'ActiveRecord is the ORM layer in Rails. Here is everything you need to know...', status: 'published')
post4 = bob.posts.create!(title: 'Background Jobs Explained', body: 'Sidekiq processes jobs asynchronously so your HTTP requests stay fast...', status: 'published')

puts 'Creating comments...'
post1.comments.create!(body: 'Great introduction!', user_id: bob.id)
post1.comments.create!(body: 'This helped me a lot, thanks.', user_id: bob.id)
post3.comments.create!(body: 'Really clear explanation of includes vs joins.', user_id: alice.id)
post4.comments.create!(body: 'Sidekiq is so much better than DelayedJob!', user_id: alice.id)

puts "Done! #{User.count} users, #{Post.count} posts, #{Comment.count} comments."
puts ''
puts 'User IDs for testing (pass as X-User-Id header):'
puts "  Alice: #{alice.id}"
puts "  Bob:   #{bob.id}"
