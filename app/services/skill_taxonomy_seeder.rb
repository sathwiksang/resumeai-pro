class SkillTaxonomySeeder
  SKILLS = {
    "technical" => {
      # Programming Languages
      "Ruby" => ["rb", "ruby lang"],
      "Python" => ["py", "python3"],
      "JavaScript" => ["js", "ecmascript", "es6"],
      "TypeScript" => ["ts"],
      "Java" => ["java se", "java ee"],
      "C#" => ["csharp", "c sharp", ".net c#"],
      "C++" => ["cpp", "cplusplus"],
      "Go" => ["golang"],
      "Rust" => [],
      "Swift" => [],
      "Kotlin" => [],
      "PHP" => [],
      "Scala" => [],
      "Elixir" => [],
      "Haskell" => [],
      "R" => ["r lang"],
      "Dart" => [],
      "Lua" => [],
      "Perl" => [],
      "Shell/Bash" => ["bash", "shell scripting", "sh"],
      "SQL" => ["structured query language"],
      "HTML" => ["html5"],
      "CSS" => ["css3", "cascading style sheets"],

      # Web Frameworks
      "Ruby on Rails" => ["rails", "ror"],
      "Django" => [],
      "Flask" => [],
      "FastAPI" => [],
      "Express.js" => ["express"],
      "Next.js" => ["nextjs"],
      "Nuxt.js" => ["nuxtjs"],
      "Spring Boot" => ["spring"],
      "ASP.NET" => ["asp.net core"],
      "Laravel" => [],
      "Phoenix" => ["phoenix framework"],
      "Sinatra" => [],

      # Frontend
      "React" => ["reactjs", "react.js"],
      "Vue.js" => ["vue", "vuejs"],
      "Angular" => ["angularjs"],
      "Svelte" => ["sveltekit"],
      "Tailwind CSS" => ["tailwindcss"],
      "Bootstrap" => [],
      "jQuery" => [],
      "Redux" => [],
      "Zustand" => [],
      "GraphQL" => ["gql"],
      "REST API" => ["restful", "rest"],

      # Databases
      "PostgreSQL" => ["postgres", "psql", "pg"],
      "MySQL" => ["mariadb"],
      "MongoDB" => ["mongo"],
      "Redis" => [],
      "Elasticsearch" => ["elastic", "es"],
      "SQLite" => [],
      "DynamoDB" => [],
      "Cassandra" => [],
      "Neo4j" => [],
      "InfluxDB" => [],

      # Cloud & DevOps
      "AWS" => ["amazon web services"],
      "Google Cloud" => ["gcp", "google cloud platform"],
      "Azure" => ["microsoft azure"],
      "Docker" => ["containerization"],
      "Kubernetes" => ["k8s"],
      "Terraform" => ["iac"],
      "Ansible" => [],
      "CI/CD" => ["continuous integration", "continuous deployment"],
      "GitHub Actions" => ["gha"],
      "Jenkins" => [],
      "CircleCI" => [],
      "GitLab CI" => [],
      "Nginx" => [],
      "Apache" => ["httpd"],
      "Linux" => ["unix", "ubuntu", "centos", "debian"],
      "Serverless" => ["lambda", "cloud functions"],

      # Data & ML
      "Machine Learning" => ["ml"],
      "Deep Learning" => ["dl", "neural networks"],
      "NLP" => ["natural language processing"],
      "Computer Vision" => ["cv", "image recognition"],
      "TensorFlow" => ["tf"],
      "PyTorch" => [],
      "Pandas" => [],
      "NumPy" => [],
      "Scikit-learn" => ["sklearn"],
      "Apache Spark" => ["spark", "pyspark"],
      "Kafka" => ["apache kafka"],
      "Airflow" => ["apache airflow"],
      "dbt" => ["data build tool"],
      "Snowflake" => [],
      "BigQuery" => [],

      # Mobile
      "React Native" => [],
      "Flutter" => [],
      "iOS Development" => ["ios", "uikit", "swiftui"],
      "Android Development" => ["android", "android sdk"],

      # Testing
      "RSpec" => [],
      "Jest" => [],
      "Cypress" => [],
      "Playwright" => [],
      "Selenium" => [],
      "JUnit" => [],
      "Pytest" => [],
      "Mocha" => [],
      "Vitest" => [],

      # Security
      "OAuth" => ["oauth2", "openid connect"],
      "JWT" => ["json web tokens"],
      "OWASP" => ["owasp top 10"],
      "Penetration Testing" => ["pentest"],
      "Encryption" => ["cryptography", "tls", "ssl"],

      # Architecture
      "Microservices" => ["service-oriented architecture", "soa"],
      "Event-Driven Architecture" => ["eda", "event sourcing"],
      "Domain-Driven Design" => ["ddd"],
      "Design Patterns" => [],
      "System Design" => [],
      "API Design" => [],
    },
    "tool" => {
      "Git" => ["github", "gitlab", "bitbucket", "version control"],
      "VS Code" => ["visual studio code"],
      "IntelliJ IDEA" => ["intellij", "jetbrains"],
      "Vim" => ["neovim"],
      "Postman" => [],
      "Figma" => [],
      "Jira" => [],
      "Confluence" => [],
      "Slack" => [],
      "Notion" => [],
      "Linear" => [],
      "Datadog" => [],
      "New Relic" => [],
      "Grafana" => [],
      "Prometheus" => [],
      "Sentry" => [],
      "PagerDuty" => [],
      "Webpack" => [],
      "Vite" => [],
      "npm" => ["yarn", "pnpm"],
      "Homebrew" => ["brew"],
    },
    "soft" => {
      "Leadership" => ["team leadership", "people management"],
      "Communication" => ["written communication", "verbal communication"],
      "Problem Solving" => ["analytical thinking", "critical thinking"],
      "Teamwork" => ["collaboration", "cross-functional"],
      "Time Management" => ["prioritization"],
      "Mentoring" => ["coaching", "training"],
      "Agile" => ["scrum", "kanban", "sprint planning"],
      "Project Management" => ["pm", "project planning"],
      "Stakeholder Management" => [],
      "Technical Writing" => ["documentation"],
      "Presentation Skills" => ["public speaking"],
      "Conflict Resolution" => [],
      "Adaptability" => ["flexibility"],
      "Attention to Detail" => [],
      "Creativity" => ["innovation"],
      "Remote Work" => ["distributed teams"],
    },
    "certification" => {
      "AWS Certified Solutions Architect" => ["aws sa", "aws solutions architect"],
      "AWS Certified Developer" => [],
      "Google Cloud Professional" => ["gcp certified"],
      "Azure Solutions Architect" => [],
      "Certified Kubernetes Administrator" => ["cka"],
      "Certified Scrum Master" => ["csm"],
      "PMP" => ["project management professional"],
      "CISSP" => [],
      "CompTIA Security+" => ["security+"],
      "Terraform Associate" => [],
      "Docker Certified Associate" => ["dca"],
      "CKAD" => ["certified kubernetes application developer"],
    },
  }.freeze

  def self.seed!
    count = 0
    SKILLS.each do |category, skills|
      skills.each do |name, aliases|
        SkillTaxonomy.find_or_create_by!(name: name) do |skill|
          skill.category = category
          skill.aliases = aliases
        end
        count += 1
      end
    end
    Rails.logger.info "[SkillTaxonomySeeder] Loaded #{count} skills"
    count
  end
end
