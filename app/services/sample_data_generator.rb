class SampleDataGenerator
  SAMPLE_RESUMES = [
    {
      filename: "sarah_chen_resume.pdf",
      raw_text: <<~TEXT,
        Sarah Chen — Senior Full Stack Developer
        Email: sarah.chen@email.com | LinkedIn: linkedin.com/in/sarahchen
        San Francisco, CA

        SUMMARY
        Experienced full-stack developer with 6 years of expertise in Ruby on Rails, React, and PostgreSQL.
        Passionate about building scalable SaaS applications and mentoring junior developers.

        EXPERIENCE
        Senior Developer — TechCorp Inc. (2021–Present)
        - Led migration of monolith to microservices architecture, reducing deployment time by 70%
        - Built real-time analytics dashboard using React, D3.js, and WebSockets
        - Mentored team of 4 junior developers through pair programming and code reviews
        - Implemented CI/CD pipeline with GitHub Actions, achieving 95% test coverage

        Full Stack Developer — StartupX (2019–2021)
        - Developed multi-tenant SaaS platform from scratch using Rails 7 and React
        - Designed and implemented RESTful API serving 50k+ daily requests
        - Optimized PostgreSQL queries, reducing average response time by 40%

        Junior Developer — WebAgency (2018–2019)
        - Built responsive web applications using React and TypeScript
        - Contributed to open-source Rails gems with 500+ GitHub stars

        EDUCATION
        BS Computer Science — UC Berkeley (2018)

        SKILLS
        Languages: Ruby, JavaScript, TypeScript, Python, SQL
        Frameworks: Ruby on Rails, React, Next.js, Express.js
        Databases: PostgreSQL, Redis, MongoDB
        Tools: Docker, Kubernetes, AWS, Git, GitHub Actions
        Soft Skills: Leadership, Mentoring, Agile, Code Review
      TEXT
      parsed_data: {
        contact: { name: "Sarah Chen", email: "sarah.chen@email.com", location: "San Francisco, CA" },
        skills: { technical: %w[Ruby JavaScript TypeScript Python SQL Rails React Next.js Express.js PostgreSQL Redis MongoDB Docker Kubernetes AWS Git], soft: %w[Leadership Mentoring Agile] },
        experience: [
          { title: "Senior Developer", company: "TechCorp Inc.", years: 3 },
          { title: "Full Stack Developer", company: "StartupX", years: 2 },
          { title: "Junior Developer", company: "WebAgency", years: 1 },
        ],
        education: [{ degree: "BS Computer Science", institution: "UC Berkeley", year: 2018 }],
      },
    },
    {
      filename: "marcus_johnson_resume.pdf",
      raw_text: <<~TEXT,
        Marcus Johnson — Backend Engineer
        marcus.j@email.com | Chicago, IL

        EXPERIENCE
        Backend Engineer — FinanceAPI (2020–Present)
        - Designed payment processing system handling $2M+ daily transactions
        - Built event-driven microservices using Go and Kafka
        - Implemented comprehensive monitoring with Datadog and PagerDuty

        Software Engineer — DataFlow Inc. (2018–2020)
        - Developed ETL pipelines processing 10TB+ daily using Apache Spark
        - Built REST APIs in Python/Django serving mobile and web clients
        - Managed PostgreSQL databases with automated backup and replication

        EDUCATION
        MS Computer Science — Northwestern University (2018)
        BS Mathematics — University of Illinois (2016)

        SKILLS
        Go, Python, Java, SQL, Django, FastAPI, PostgreSQL, Kafka, Spark, Docker, AWS, Datadog
      TEXT
      parsed_data: {
        contact: { name: "Marcus Johnson", email: "marcus.j@email.com", location: "Chicago, IL" },
        skills: { technical: %w[Go Python Java SQL Django FastAPI PostgreSQL Kafka Spark Docker AWS Datadog], soft: [] },
        experience: [
          { title: "Backend Engineer", company: "FinanceAPI", years: 4 },
          { title: "Software Engineer", company: "DataFlow Inc.", years: 2 },
        ],
        education: [
          { degree: "MS Computer Science", institution: "Northwestern University", year: 2018 },
          { degree: "BS Mathematics", institution: "University of Illinois", year: 2016 },
        ],
      },
    },
    {
      filename: "priya_patel_resume.pdf",
      raw_text: <<~TEXT,
        Priya Patel — Frontend Engineer
        priya.patel@email.com | New York, NY

        EXPERIENCE
        Senior Frontend Engineer — DesignTech (2021–Present)
        - Led redesign of component library using React 18 and TypeScript
        - Improved Lighthouse performance score from 45 to 95
        - Implemented accessibility standards (WCAG 2.1 AA) across all products

        Frontend Developer — E-Commerce Co (2019–2021)
        - Built responsive e-commerce platform with Next.js and Tailwind CSS
        - Developed real-time search with Elasticsearch integration
        - Reduced bundle size by 60% through code splitting and lazy loading

        EDUCATION
        BS Information Systems — NYU (2019)

        SKILLS
        JavaScript, TypeScript, React, Next.js, Vue.js, Tailwind CSS, HTML, CSS, Figma, Accessibility, Performance Optimization
      TEXT
      parsed_data: {
        contact: { name: "Priya Patel", email: "priya.patel@email.com", location: "New York, NY" },
        skills: { technical: %w[JavaScript TypeScript React Next.js Vue.js TailwindCSS HTML CSS Figma], soft: %w[Accessibility] },
        experience: [
          { title: "Senior Frontend Engineer", company: "DesignTech", years: 3 },
          { title: "Frontend Developer", company: "E-Commerce Co", years: 2 },
        ],
        education: [{ degree: "BS Information Systems", institution: "NYU", year: 2019 }],
      },
    },
    {
      filename: "alex_rivera_resume.pdf",
      raw_text: <<~TEXT,
        Alex Rivera — DevOps Engineer
        alex.r@email.com | Austin, TX

        EXPERIENCE
        Senior DevOps Engineer — CloudScale (2020–Present)
        - Managed Kubernetes clusters serving 1M+ daily active users
        - Designed IaC with Terraform, managing 200+ AWS resources
        - Built observability stack with Prometheus, Grafana, and AlertManager
        - Reduced infrastructure costs by 35% through right-sizing and spot instances

        DevOps Engineer — TechStartup (2018–2020)
        - Implemented GitOps workflow with ArgoCD and GitHub Actions
        - Containerized 20+ microservices with Docker and Kubernetes
        - Managed CI/CD pipelines reducing deployment time from 1 hour to 5 minutes

        EDUCATION
        BS Computer Engineering — UT Austin (2018)

        CERTIFICATIONS
        AWS Certified Solutions Architect Professional
        Certified Kubernetes Administrator (CKA)

        SKILLS
        AWS, GCP, Docker, Kubernetes, Terraform, Ansible, Linux, Python, Bash, Prometheus, Grafana, Jenkins, GitHub Actions
      TEXT
      parsed_data: {
        contact: { name: "Alex Rivera", email: "alex.r@email.com", location: "Austin, TX" },
        skills: { technical: %w[AWS GCP Docker Kubernetes Terraform Ansible Linux Python Bash Prometheus Grafana Jenkins], soft: [] },
        experience: [
          { title: "Senior DevOps Engineer", company: "CloudScale", years: 4 },
          { title: "DevOps Engineer", company: "TechStartup", years: 2 },
        ],
        education: [{ degree: "BS Computer Engineering", institution: "UT Austin", year: 2018 }],
      },
    },
    {
      filename: "emma_wilson_resume.pdf",
      raw_text: <<~TEXT,
        Emma Wilson — Data Scientist
        emma.w@email.com | Seattle, WA

        EXPERIENCE
        Senior Data Scientist — ML Insights (2021–Present)
        - Built NLP models for sentiment analysis with 94% accuracy using BERT
        - Developed recommendation engine increasing user engagement by 25%
        - Led A/B testing framework used across 50+ experiments per quarter

        Data Analyst — RetailCo (2019–2021)
        - Created predictive models for inventory optimization saving $500K annually
        - Built interactive dashboards in Tableau for executive decision-making
        - Processed and cleaned datasets of 100M+ records using PySpark

        EDUCATION
        MS Data Science — University of Washington (2019)
        BS Statistics — UCLA (2017)

        SKILLS
        Python, R, SQL, TensorFlow, PyTorch, Scikit-learn, Pandas, Spark, NLP, Machine Learning, Tableau, A/B Testing
      TEXT
      parsed_data: {
        contact: { name: "Emma Wilson", email: "emma.w@email.com", location: "Seattle, WA" },
        skills: { technical: %w[Python R SQL TensorFlow PyTorch Scikit-learn Pandas Spark NLP MachineLearning Tableau], soft: [] },
        experience: [
          { title: "Senior Data Scientist", company: "ML Insights", years: 3 },
          { title: "Data Analyst", company: "RetailCo", years: 2 },
        ],
        education: [
          { degree: "MS Data Science", institution: "University of Washington", year: 2019 },
          { degree: "BS Statistics", institution: "UCLA", year: 2017 },
        ],
      },
    },
  ].freeze

  SAMPLE_JDS = [
    {
      title: "Senior Ruby on Rails Developer",
      company: "TechCorp",
      description: <<~TEXT,
        We're looking for an experienced Rails developer to join our platform team.

        Requirements:
        - 5+ years of Ruby on Rails experience
        - Strong PostgreSQL and Redis knowledge
        - Experience with React or similar frontend framework
        - Familiarity with Docker and CI/CD pipelines
        - Strong communication and mentoring skills

        Nice to Have:
        - Experience with Kubernetes
        - Contributions to open-source projects
        - AWS certification
      TEXT
      requirements: {
        required_skills: %w[Ruby Rails PostgreSQL Redis React Docker],
        preferred_skills: %w[Kubernetes AWS TypeScript],
        experience_years: { min: 5, max: 10 },
        education_requirements: ["Bachelor's in CS or equivalent"],
      },
      required_skills: %w[Ruby Rails PostgreSQL Redis React Docker],
      preferred_skills: %w[Kubernetes AWS TypeScript],
    },
    {
      title: "Full Stack Engineer",
      company: "StartupAI",
      description: <<~TEXT,
        Join our fast-growing AI startup to build the next generation of developer tools.

        Requirements:
        - 3+ years full-stack development experience
        - Proficiency in TypeScript and React
        - Backend experience with Node.js or Python
        - Database design experience (PostgreSQL preferred)
        - Experience with cloud services (AWS/GCP)

        Nice to Have:
        - Machine learning or AI experience
        - GraphQL experience
        - Open source contributions
      TEXT
      requirements: {
        required_skills: %w[TypeScript React Node.js Python PostgreSQL AWS],
        preferred_skills: %w[MachineLearning GraphQL],
        experience_years: { min: 3, max: 7 },
        education_requirements: ["Bachelor's in CS or equivalent"],
      },
      required_skills: %w[TypeScript React Node.js Python PostgreSQL AWS],
      preferred_skills: %w[MachineLearning GraphQL],
    },
    {
      title: "DevOps/Platform Engineer",
      company: "CloudNative Inc",
      description: <<~TEXT,
        We need a DevOps engineer to manage our Kubernetes infrastructure at scale.

        Requirements:
        - 3+ years DevOps/SRE experience
        - Expert-level Kubernetes and Docker knowledge
        - Infrastructure as Code (Terraform/Pulumi)
        - CI/CD pipeline design and maintenance
        - Strong Linux systems administration
        - Monitoring and observability (Prometheus/Grafana)

        Nice to Have:
        - CKA or AWS certification
        - Go or Python scripting
        - Service mesh experience (Istio)
      TEXT
      requirements: {
        required_skills: %w[Kubernetes Docker Terraform Linux Prometheus Grafana],
        preferred_skills: %w[Go Python CKA AWS],
        experience_years: { min: 3, max: 8 },
        education_requirements: ["Bachelor's in CS or equivalent"],
      },
      required_skills: %w[Kubernetes Docker Terraform Linux Prometheus Grafana],
      preferred_skills: %w[Go Python AWS],
    },
  ].freeze

  def self.create_sample_data(organization, admin)
    resumes = create_resumes(organization, admin)
    jds = create_job_descriptions(organization, admin)
    create_scores(organization, admin, resumes, jds)
  end

  def self.create_resumes(organization, user)
    SAMPLE_RESUMES.map do |data|
      Resume.find_or_create_by!(
        organization: organization,
        user: user,
        filename: data[:filename]
      ) do |r|
        r.raw_text = data[:raw_text]
        r.parsed_data = data[:parsed_data]
        r.content_type = "application/pdf"
        r.content_digest = Digest::SHA256.hexdigest(data[:raw_text])
        r.status = :ready
      end
    end
  end

  def self.create_job_descriptions(organization, user)
    SAMPLE_JDS.map do |data|
      JobDescription.find_or_create_by!(
        organization: organization,
        user: user,
        title: data[:title]
      ) do |jd|
        jd.company = data[:company]
        jd.description = data[:description]
        jd.requirements = data[:requirements]
        jd.required_skills = data[:required_skills]
        jd.preferred_skills = data[:preferred_skills]
        jd.status = :ready
      end
    end
  end

  def self.create_scores(organization, admin, resumes, jds)
    scores_data = [
      # Sarah Chen vs Senior Rails Dev → excellent match
      { resume_idx: 0, jd_idx: 0, overall: 92, keyword: 88, semantic: 90, skills: 95, experience: 93, education: 85, format: 90,
        grade: "A+", strengths: ["Strong Rails + React combo", "Excellent PostgreSQL experience", "Team leadership and mentoring"],
        weaknesses: ["Could highlight Docker/K8s experience more"],
        recommendations: [{ area: "Resume", priority: "low", suggestion: "Add specific Kubernetes project details", impact: "minor" }] },
      # Marcus Johnson vs Senior Rails Dev → partial match
      { resume_idx: 1, jd_idx: 0, overall: 58, keyword: 45, semantic: 55, skills: 50, experience: 70, education: 72, format: 75,
        grade: "D", strengths: ["Strong backend engineering experience", "Good PostgreSQL knowledge"],
        weaknesses: ["No Ruby/Rails experience", "No React experience", "Backend-focused, lacks frontend skills"],
        recommendations: [{ area: "Skills", priority: "high", suggestion: "Learn Ruby on Rails for this role", impact: "major" }] },
      # Priya Patel vs Full Stack Engineer → good match
      { resume_idx: 2, jd_idx: 1, overall: 78, keyword: 82, semantic: 75, skills: 80, experience: 76, education: 70, format: 85,
        grade: "B+", strengths: ["Excellent React/TypeScript skills", "Strong frontend performance focus"],
        weaknesses: ["Limited backend experience", "No Python listed"],
        recommendations: [{ area: "Skills", priority: "medium", suggestion: "Add Node.js/Python backend projects", impact: "moderate" }] },
      # Alex Rivera vs DevOps Engineer → excellent match
      { resume_idx: 3, jd_idx: 2, overall: 95, keyword: 95, semantic: 93, skills: 97, experience: 95, education: 88, format: 92,
        grade: "A+", strengths: ["Perfect skill alignment", "CKA certified", "Strong production experience at scale"],
        weaknesses: ["No service mesh experience mentioned"],
        recommendations: [{ area: "Resume", priority: "low", suggestion: "Mention Istio or service mesh if applicable", impact: "minor" }] },
      # Emma Wilson vs Full Stack Engineer → moderate match
      { resume_idx: 4, jd_idx: 1, overall: 65, keyword: 55, semantic: 62, skills: 60, experience: 68, education: 80, format: 78,
        grade: "C", strengths: ["Strong Python skills", "Machine learning experience (nice to have)"],
        weaknesses: ["No TypeScript/React experience", "Data science focus vs full-stack role"],
        recommendations: [{ area: "Skills", priority: "high", suggestion: "Build projects with React and TypeScript", impact: "major" }] },
    ]

    scores_data.each do |data|
      resume = resumes[data[:resume_idx]]
      jd = jds[data[:jd_idx]]
      next if ResumeScore.exists?(resume: resume, job_description: jd)

      ResumeScore.create!(
        organization: organization,
        resume: resume,
        job_description: jd,
        user: admin,
        status: :completed,
        overall_score: data[:overall],
        keyword_score: data[:keyword],
        semantic_score: data[:semantic],
        skills_score: data[:skills],
        experience_score: data[:experience],
        education_score: data[:education],
        format_score: data[:format],
        grade: data[:grade],
        strengths: data[:strengths],
        weaknesses: data[:weaknesses],
        recommendations: data[:recommendations],
        keyword_analysis: {
          matched: data[:strengths].map { |s| { keyword: s.split.first, context: s } },
          partial: [],
          missing: data[:weaknesses].map { |w| w.split.first(3).join(" ") },
          required_match_rate: 70,
        },
        llm_model: "qwen2.5:3b",
        llm_tokens_used: rand(800..2000),
        processing_time_seconds: rand(5.0..25.0).round(1),
      )
    end
  end
end
