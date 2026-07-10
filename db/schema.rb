# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_03_04_043807) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "btree_gist"
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pg_trgm"
  enable_extension "pgcrypto"
  enable_extension "uuid-ossp"
  enable_extension "vector"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "billing_events", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "event_type", null: false
    t.bigint "organization_id", null: false
    t.jsonb "payload", default: {}
    t.string "status", default: "processed"
    t.string "stripe_event_id", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id"], name: "index_billing_events_on_organization_id"
    t.index ["stripe_event_id"], name: "index_billing_events_on_stripe_event_id", unique: true
  end

  create_table "invitations", force: :cascade do |t|
    t.datetime "accepted_at"
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.datetime "expires_at", null: false
    t.bigint "invited_by_id", null: false
    t.bigint "organization_id", null: false
    t.integer "role", default: 0, null: false
    t.integer "status", default: 0, null: false
    t.string "token", null: false
    t.datetime "updated_at", null: false
    t.index ["invited_by_id"], name: "index_invitations_on_invited_by_id"
    t.index ["organization_id", "email"], name: "index_invitations_on_org_email_pending", unique: true, where: "(status = 0)"
    t.index ["organization_id"], name: "index_invitations_on_organization_id"
    t.index ["token"], name: "index_invitations_on_token", unique: true
  end

  create_table "job_descriptions", force: :cascade do |t|
    t.string "company"
    t.datetime "created_at", null: false
    t.text "description", null: false
    t.vector "embedding", limit: 768
    t.text "error_message"
    t.bigint "organization_id", null: false
    t.jsonb "preferred_skills", default: []
    t.jsonb "required_skills", default: []
    t.jsonb "requirements", default: {}
    t.integer "status", default: 0
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["embedding"], name: "index_job_descriptions_on_embedding", opclass: :vector_cosine_ops, using: :hnsw
    t.index ["organization_id"], name: "index_job_descriptions_on_organization_id"
    t.index ["user_id"], name: "index_job_descriptions_on_user_id"
  end

  create_table "organizations", force: :cascade do |t|
    t.integer "analyses_used_this_month", default: 0
    t.string "billing_email"
    t.datetime "created_at", null: false
    t.datetime "current_period_end"
    t.integer "job_descriptions_count", default: 0, null: false
    t.integer "monthly_analysis_limit", default: 10
    t.string "name", null: false
    t.string "plan", default: "free"
    t.integer "resumes_count", default: 0, null: false
    t.jsonb "settings", default: {}
    t.string "stripe_customer_id"
    t.string "stripe_subscription_id"
    t.string "subdomain", null: false
    t.string "subscription_status", default: "active"
    t.datetime "updated_at", null: false
    t.integer "users_count", default: 0, null: false
    t.index ["stripe_customer_id"], name: "index_organizations_on_stripe_customer_id", unique: true
    t.index ["stripe_subscription_id"], name: "index_organizations_on_stripe_subscription_id", unique: true
    t.index ["subdomain"], name: "index_organizations_on_subdomain", unique: true
  end

  create_table "resume_scores", force: :cascade do |t|
    t.string "content_pair_digest"
    t.datetime "created_at", null: false
    t.decimal "education_score", precision: 5, scale: 2
    t.text "error_message"
    t.jsonb "experience_analysis", default: {}
    t.decimal "experience_score", precision: 5, scale: 2
    t.decimal "format_score", precision: 5, scale: 2
    t.string "grade"
    t.bigint "job_description_id", null: false
    t.jsonb "keyword_analysis", default: {}
    t.decimal "keyword_score", precision: 5, scale: 2
    t.string "llm_model"
    t.integer "llm_tokens_used"
    t.bigint "organization_id", null: false
    t.decimal "overall_score", precision: 5, scale: 2
    t.float "processing_time_seconds"
    t.jsonb "recommendations", default: []
    t.bigint "resume_id", null: false
    t.decimal "semantic_score", precision: 5, scale: 2
    t.jsonb "skills_analysis", default: {}
    t.decimal "skills_score", precision: 5, scale: 2
    t.integer "status", default: 0
    t.jsonb "strengths", default: []
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.jsonb "weaknesses", default: []
    t.index ["content_pair_digest"], name: "index_resume_scores_on_content_pair_digest", unique: true
    t.index ["job_description_id"], name: "index_resume_scores_on_job_description_id"
    t.index ["organization_id"], name: "index_resume_scores_on_organization_id"
    t.index ["overall_score"], name: "index_resume_scores_on_overall_score"
    t.index ["resume_id", "job_description_id"], name: "index_resume_scores_on_resume_id_and_job_description_id", unique: true
    t.index ["resume_id"], name: "index_resume_scores_on_resume_id"
    t.index ["user_id"], name: "index_resume_scores_on_user_id"
  end

  create_table "resumes", force: :cascade do |t|
    t.string "content_digest"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.vector "embedding", limit: 768
    t.text "error_message"
    t.string "filename", null: false
    t.bigint "organization_id", null: false
    t.jsonb "parsed_data", default: {}
    t.text "raw_text"
    t.integer "status", default: 0
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["content_digest"], name: "index_resumes_on_content_digest"
    t.index ["embedding"], name: "index_resumes_on_embedding", opclass: :vector_cosine_ops, using: :hnsw
    t.index ["organization_id"], name: "index_resumes_on_organization_id"
    t.index ["user_id"], name: "index_resumes_on_user_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "ip_address"
    t.datetime "updated_at", null: false
    t.string "user_agent"
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "skill_taxonomies", force: :cascade do |t|
    t.string "aliases", default: [], array: true
    t.string "category"
    t.datetime "created_at", null: false
    t.vector "embedding", limit: 768
    t.string "name", null: false
    t.string "parent_skill"
    t.datetime "updated_at", null: false
    t.index ["category"], name: "index_skill_taxonomies_on_category"
    t.index ["embedding"], name: "index_skill_taxonomies_on_embedding", opclass: :vector_cosine_ops, using: :hnsw
    t.index ["name"], name: "index_skill_taxonomies_on_name", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "avatar_url"
    t.datetime "created_at", null: false
    t.string "email_address", null: false
    t.string "first_name"
    t.bigint "invitation_id"
    t.string "last_name"
    t.bigint "organization_id", null: false
    t.string "password_digest", null: false
    t.jsonb "preferences", default: {}
    t.integer "role", default: 0
    t.datetime "updated_at", null: false
    t.index ["invitation_id"], name: "index_users_on_invitation_id"
    t.index ["organization_id", "email_address"], name: "index_users_on_organization_id_and_email_address", unique: true
    t.index ["organization_id"], name: "index_users_on_organization_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "billing_events", "organizations"
  add_foreign_key "invitations", "organizations"
  add_foreign_key "invitations", "users", column: "invited_by_id"
  add_foreign_key "job_descriptions", "organizations"
  add_foreign_key "job_descriptions", "users"
  add_foreign_key "resume_scores", "job_descriptions"
  add_foreign_key "resume_scores", "organizations"
  add_foreign_key "resume_scores", "resumes"
  add_foreign_key "resume_scores", "users"
  add_foreign_key "resumes", "organizations"
  add_foreign_key "resumes", "users"
  add_foreign_key "sessions", "users"
  add_foreign_key "users", "invitations"
  add_foreign_key "users", "organizations"
end
