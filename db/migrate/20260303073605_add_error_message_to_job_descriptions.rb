class AddErrorMessageToJobDescriptions < ActiveRecord::Migration[8.1]
  def change
    add_column :job_descriptions, :error_message, :text
  end
end
