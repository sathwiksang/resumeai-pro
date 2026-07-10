class SessionsController < ApplicationController
  allow_unauthenticated_access only: [:new, :create]

  def new
    return redirect_to(dashboard_path) if authenticated?
    render inertia: "Auth/Login"
  end

  def create
    user = User.find_by(email_address: params[:email_address])
    if user&.authenticate(params[:password])
      start_new_session_for(user)
      redirect_to after_authentication_url, notice: "Welcome back, #{user.first_name}!"
    else
      redirect_to new_session_path, alert: "Invalid email or password."
    end
  end

  def destroy
    terminate_session
    redirect_to root_path, notice: "You have been logged out."
  end

  private

  def skip_pundit?
    true
  end
end
