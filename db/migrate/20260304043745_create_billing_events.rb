class CreateBillingEvents < ActiveRecord::Migration[8.1]
  def change
    create_table :billing_events do |t|
      t.references :organization, null: false, foreign_key: true
      t.string :stripe_event_id, null: false
      t.string :event_type, null: false
      t.jsonb :payload, default: {}
      t.string :status, default: "processed"
      t.timestamps
    end

    add_index :billing_events, :stripe_event_id, unique: true
  end
end
