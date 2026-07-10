class RegistrationsController < ApplicationController
  allow_unauthenticated_access only: [:new, :create]

  def new
    return redirect_to(dashboard_path) if authenticated?
    render inertia: "Auth/Register"
  end

  def create
    organization = Organization.new(organization_params)
    user = organization.users.build(user_params.merge(role: :admin))

    ActiveRecord::Base.transaction do
      organization.save!
      user.save!
    end

    start_new_session_for(user)
    redirect_to dashboard_path, notice: "Welcome to ResumeAI Pro!"
  rescue ActiveRecord::RecordInvalid => e
    redirect_to new_registration_path, alert: e.record.errors.full_messages.join(", ")
  end

  private

  def organization_params
    params.require(:organization).permit(:name, :subdomain)
  end

  def user_params
    params.require(:user).permit(:email_address, :password, :password_confirmation, :first_name, :last_name)
  end

  def skip_pundit?
    true
  end
end
