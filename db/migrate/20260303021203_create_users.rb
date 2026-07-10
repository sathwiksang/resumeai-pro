class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.references :organization, null: false, foreign_key: true
      t.string :email_address, null: false
      t.string :password_digest, null: false
      t.string :first_name
      t.string :last_name
      t.integer :role, default: 0
      t.string :avatar_url
      t.jsonb :preferences, default: {}
      t.timestamps
    end
    add_index :users, [:organization_id, :email_address], unique: true
  end
end
