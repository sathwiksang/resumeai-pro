class AddResourceCountersToOrganizations < ActiveRecord::Migration[8.1]
  def change
    add_column :organizations, :resumes_count, :integer, default: 0, null: false
    add_column :organizations, :job_descriptions_count, :integer, default: 0, null: false
    add_column :organizations, :users_count, :integer, default: 0, null: false
  end

  # Backfill is handled via a rake task or manually after migration
end
