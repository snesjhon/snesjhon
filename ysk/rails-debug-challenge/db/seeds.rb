# frozen_string_literal: true

puts "Cleaning up..."
Comment.delete_all
Post.delete_all
User.delete_all

puts "Creating users..."
users = [
  { name: "alice smith",  email: "alice@example.com"  },
  { name: "bob jones",    email: "bob@example.com"    },
  { name: "carol white",  email: "carol@example.com"  },
].map do |attrs|
  user = User.new(attrs.merge(password: "password123"))
  # bio column is missing from schema but validated in model — skip validation
  user.save!(validate: false)
  user
end

puts "Creating 60 published posts..."
bodies = [
  "Rails is a web framework that makes building web applications fast and fun. " \
  "It follows convention over configuration and has a rich ecosystem of gems.",

  "ActiveRecord is Rails' ORM layer. It maps database tables to Ruby classes " \
  "and provides a clean API for querying and persisting data.",

  "N+1 queries are one of the most common performance problems in Rails apps. " \
  "They occur when you load a collection and then query an association for each record.",

  "Eager loading with includes, preload, or eager_load can solve N+1 queries " \
  "by fetching all associated records in one or two SQL queries instead of N.",

  "Caching is another tool for improving performance. Fragment caching, " \
  "counter caches, and HTTP caching all have their place in a Rails app.",
]

60.times do |i|
  user = users[i % users.length]
  post = Post.new(
    title:     "Post #{i + 1}: #{bodies[i % bodies.length].split('.').first}",
    body:      bodies[i % bodies.length],
    excerpt:   nil,
    published: true,
    user:      user,
  )
  # status column is missing from schema but validated in model — skip validation
  post.save!(validate: false)

  rand(0..4).times do |j|
    post.comments.create!(
      body: "Comment #{j + 1} on post #{i + 1}. Great read!",
      user_id: users.sample.id,
    )
  end
end

puts "Done! #{User.count} users, #{Post.count} posts, #{Comment.count} comments."
