# frozen_string_literal: true

class CreatePosts < ActiveRecord::Migration[7.1]
  def change
    create_table :posts do |t|
      t.string :title, null: false
      t.text :body, null: false
      t.string :status, null: false, default: 'draft'
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end

    add_index :posts, :status
  end
end
