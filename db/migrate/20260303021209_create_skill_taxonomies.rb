class CreateSkillTaxonomies < ActiveRecord::Migration[8.1]
  def change
    create_table :skill_taxonomies do |t|
      t.string :name, null: false
      t.string :category
      t.string :parent_skill
      t.string :aliases, array: true, default: []
      t.column :embedding, :vector, limit: 768
      t.timestamps
    end
    add_index :skill_taxonomies, :name, unique: true
    add_index :skill_taxonomies, :category
    add_index :skill_taxonomies, :embedding,
              using: :hnsw,
              opclass: :vector_cosine_ops,
              name: "index_skill_taxonomies_on_embedding"
  end
end
