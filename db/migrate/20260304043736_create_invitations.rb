class CreateInvitations < ActiveRecord::Migration[8.1]
  def change
    create_table :invitations do |t|
      t.references :organization, null: false, foreign_key: true
      t.references :invited_by, null: false, foreign_key: { to_table: :users }
      t.string :email, null: false
      t.string :token, null: false
      t.integer :role, null: false, default: 0
      t.integer :status, null: false, default: 0
      t.datetime :accepted_at
      t.datetime :expires_at, null: false
      t.timestamps
    end

    add_index :invitations, :token, unique: true
    add_index :invitations, [:organization_id, :email], unique: true, where: "status = 0", name: "index_invitations_on_org_email_pending"
  end
end
