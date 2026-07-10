class PagesController < ApplicationController
  allow_unauthenticated_access

  def landing
    return redirect_to(dashboard_path) if authenticated?
    render inertia: "Landing"
  end

  def how_it_works = render inertia: "Docs/HowItWorks"
  def features = render inertia: "Docs/Features"
  def architecture = render inertia: "Docs/Architecture"
  def technical_docs = render inertia: "Docs/TechnicalDocs"
  def faq = render inertia: "Docs/FAQ"

  private

  def skip_pundit?
    true
  end
end
