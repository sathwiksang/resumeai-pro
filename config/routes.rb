Rails.application.routes.draw do
  # Health check
  get "up" => "rails/health#show", as: :rails_health_check

  # Landing page (unauthenticated)
  get "welcome", to: "pages#landing", as: :landing

  # Public docs
  get "how-it-works", to: "pages#how_it_works"
  get "features", to: "pages#features"
  get "architecture", to: "pages#architecture"
  get "docs", to: "pages#technical_docs"
  get "faq", to: "pages#faq"

  # Authenticated help
  get "help", to: "help#index"
  get "help/getting-started", to: "help#getting_started"

  # Authentication
  resource :session, only: [:new, :create, :destroy]
  resource :registration, only: [:new, :create]

  # Invitation acceptance (public)
  get  "invitations/:token", to: "invitation_acceptances#show", as: :invitation_acceptance
  post "invitations/:token", to: "invitation_acceptances#create"

  # Core resources
  resources :resumes
  resources :job_descriptions
  resources :resume_scores, only: [:index, :show, :create, :destroy]

  # Dashboard
  get "dashboard", to: "dashboard#index"

  # Quick Score wizard
  get  "quick-score", to: "quick_scores#new", as: :new_quick_score
  post "quick-score", to: "quick_scores#create", as: :quick_score

  # Compare resumes
  get "compare", to: "compares#show", as: :compare

  # Admin
  namespace :admin do
    resources :users
    resource :billing, only: [:show] do
      post :create_checkout, on: :member
      post :create_portal_session, on: :member
    end
    resources :invitations, only: [:index, :create, :destroy] do
      post :resend, on: :member
    end
    resource :settings, only: [:show, :update]
  end

  # Stripe webhook
  namespace :webhooks do
    post "stripe", to: "stripe#create"
  end

  # Job monitoring (admin only in production)
  mount MissionControl::Jobs::Engine, at: "/admin/jobs"

  # Root — landing page for visitors, redirects to dashboard if logged in
  root "pages#landing"
end
