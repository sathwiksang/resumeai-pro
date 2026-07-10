# ResumeAI Pro — Seed Data
# Run with: bin/rails db:seed
# Idempotent — safe to run multiple times

puts "=== ResumeAI Pro Seed Data ==="

# ─── Step 1: Skill Taxonomy ───
puts "\n[1/3] Seeding skill taxonomy..."
count = SkillTaxonomySeeder.seed!
puts "      #{count} skills loaded"

# ─── Step 2: Demo Organization ───
puts "\n[2/3] Creating demo organization..."
demo_org = Organization.find_or_create_by!(subdomain: "demo") do |org|
  org.name = "Demo Corp"
  org.plan = "pro"
  org.monthly_analysis_limit = 200
end
puts "      Organization: #{demo_org.name} (#{demo_org.plan} plan)"

# Admin user
admin = User.find_or_create_by!(email_address: "admin@demo.com") do |u|
  u.organization = demo_org
  u.first_name = "Demo"
  u.last_name = "Admin"
  u.password = "demo1234"
  u.role = :admin
end
puts "      Admin: #{admin.email_address}"

# Recruiter user
recruiter = User.find_or_create_by!(email_address: "recruiter@demo.com") do |u|
  u.organization = demo_org
  u.first_name = "Jane"
  u.last_name = "Recruiter"
  u.password = "demo1234"
  u.role = :recruiter
end
puts "      Recruiter: #{recruiter.email_address}"

# Candidate user
candidate = User.find_or_create_by!(email_address: "candidate@demo.com") do |u|
  u.organization = demo_org
  u.first_name = "John"
  u.last_name = "Candidate"
  u.password = "demo1234"
  u.role = :candidate
end
puts "      Candidate: #{candidate.email_address}"

# Update org counters
demo_org.update_columns(users_count: demo_org.users.count)

# ─── Step 3: Sample Data ───
puts "\n[3/3] Generating sample resumes, job descriptions, and scores..."
SampleDataGenerator.create_sample_data(demo_org, admin)

# Update org counters
demo_org.update_columns(
  resumes_count: demo_org.resumes.count,
  job_descriptions_count: demo_org.job_descriptions.count,
)

puts "      #{demo_org.resumes.count} resumes"
puts "      #{demo_org.job_descriptions.count} job descriptions"
puts "      #{demo_org.resume_scores.count} score analyses"

puts "\n=== Seeding complete! ==="
puts "Login at http://localhost:3100 with:"
puts "  Admin:     admin@demo.com / demo1234"
puts "  Recruiter: recruiter@demo.com / demo1234"
puts "  Candidate: candidate@demo.com / demo1234"
