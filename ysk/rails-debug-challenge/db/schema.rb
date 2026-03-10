# frozen_string_literal: true

ActiveRecord::Schema[7.1].define(version: 20_240_115_000_003) do
  create_table 'users', force: :cascade do |t|
    t.string   'name',       null: false
    t.string   'email',      null: false
    t.string   'password_digest'
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
    t.index ['email'], name: 'index_users_on_email', unique: true
  end

  create_table 'posts', force: :cascade do |t|
    t.string   'title',      null: false
    t.text     'body',       null: false
    t.string   'excerpt'
    t.integer  'user_id',    null: false
    t.boolean  'published',  default: false
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
    t.index ['user_id'], name: 'index_posts_on_user_id'
  end

  create_table 'comments', force: :cascade do |t|
    t.text     'body',       null: false
    t.integer  'post_id',    null: false
    t.integer  'user_id',    null: false
    t.datetime 'created_at', null: false
    t.datetime 'updated_at', null: false
    t.index ['post_id'], name: 'index_comments_on_post_id'
    t.index ['user_id'], name: 'index_comments_on_user_id'
  end

  add_foreign_key 'posts', 'users'
  add_foreign_key 'comments', 'posts'
  add_foreign_key 'comments', 'users'
end
