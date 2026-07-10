class CreateOrganizations < ActiveRecord::Migration[8.1]
  def change
    create_table :organizations do |t|
      t.string :name, null: false
      t.string :subdomain, null: false, index: { unique: true }
      t.string :plan, default: "free"
      t.jsonb :settings, default: {}
      t.integer :monthly_analysis_limit, default: 10
      t.integer :analyses_used_this_month, default: 0
      t.timestamps
    end
  end
end
