class CreateResumeScores < ActiveRecord::Migration[8.1]
  def change
    create_table :resume_scores do |t|
      t.references :organization, null: false, foreign_key: true
      t.references :resume, null: false, foreign_key: true
      t.references :job_description, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true

      # Overall
      t.decimal :overall_score, precision: 5, scale: 2
      t.string :grade

      # Component scores (0-100)
      t.decimal :keyword_score, precision: 5, scale: 2
      t.decimal :semantic_score, precision: 5, scale: 2
      t.decimal :skills_score, precision: 5, scale: 2
      t.decimal :experience_score, precision: 5, scale: 2
      t.decimal :education_score, precision: 5, scale: 2
      t.decimal :format_score, precision: 5, scale: 2

      # Detailed analysis (JSONB)
      t.jsonb :keyword_analysis, default: {}
      t.jsonb :skills_analysis, default: {}
      t.jsonb :experience_analysis, default: {}
      t.jsonb :recommendations, default: []
      t.jsonb :strengths, default: []
      t.jsonb :weaknesses, default: []

      # Meta
      t.string :llm_model
      t.integer :llm_tokens_used
      t.float :processing_time_seconds
      t.string :content_pair_digest
      t.integer :status, default: 0
      t.text :error_message

      t.timestamps
    end
    add_index :resume_scores, :content_pair_digest, unique: true
    add_index :resume_scores, [:resume_id, :job_description_id], unique: true
    add_index :resume_scores, :overall_score
  end
end
