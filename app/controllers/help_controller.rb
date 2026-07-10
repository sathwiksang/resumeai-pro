class HelpController < ApplicationController
  def index = render inertia: "Help/Index"
  def getting_started = render inertia: "Help/GettingStarted"

  private

  def skip_pundit?
    true
  end
end
