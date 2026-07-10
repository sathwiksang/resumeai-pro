class CreateJobDescriptions < ActiveRecord::Migration[8.1]
  def change
    create_table :job_descriptions do |t|
      t.references :organization, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.string :title, null: false
      t.string :company
      t.text :description, null: false
      t.jsonb :requirements, default: {}
      t.jsonb :required_skills, default: []
      t.jsonb :preferred_skills, default: []
      t.column :embedding, :vector, limit: 768
      t.integer :status, default: 0
      t.timestamps
    end
    add_index :job_descriptions, :embedding,
              using: :hnsw,
              opclass: :vector_cosine_ops,
              name: "index_job_descriptions_on_embedding"
  end
end
