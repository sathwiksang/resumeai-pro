class CreateResumes < ActiveRecord::Migration[8.1]
  def change
    create_table :resumes do |t|
      t.references :organization, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.string :filename, null: false
      t.string :content_type
      t.text :raw_text
      t.jsonb :parsed_data, default: {}
      t.column :embedding, :vector, limit: 768
      t.string :content_digest
      t.integer :status, default: 0
      t.text :error_message
      t.timestamps
    end
    add_index :resumes, :content_digest
    add_index :resumes, :embedding,
              using: :hnsw,
              opclass: :vector_cosine_ops,
              name: "index_resumes_on_embedding"
  end
end
