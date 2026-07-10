class InvitationAcceptancesController < ApplicationController
  allow_unauthenticated_access
  before_action :set_invitation

  def show
    if @invitation.nil?
      render inertia: "Invitations/Accept", props: { error: "Invitation not found." }
    elsif @invitation.accepted?
      render inertia: "Invitations/Accept", props: { error: "This invitation has already been accepted." }
    elsif @invitation.past_expiry? || @invitation.expired?
      render inertia: "Invitations/Accept", props: { error: "This invitation has expired." }
    else
      render inertia: "Invitations/Accept", props: {
        invitation: {
          token: @invitation.token,
          email: @invitation.email,
          role: @invitation.role,
          organization_name: @invitation.organization.name,
          inviter_name: @invitation.invited_by.full_name,
          expires_at: @invitation.expires_at.iso8601,
        },
      }
    end
  end

  def create
    if @invitation.nil? || !@invitation.pending? || @invitation.past_expiry?
      redirect_to new_session_path, alert: "Invalid or expired invitation."
      return
    end

    user = @invitation.organization.users.build(
      first_name: params[:first_name],
      last_name: params[:last_name],
      email_address: @invitation.email,
      password: params[:password],
      password_confirmation: params[:password_confirmation],
      role: @invitation.role,
    )

    if user.save
      @invitation.accept!(user)
      start_new_session_for(user)
      redirect_to root_path, notice: "Welcome to #{@invitation.organization.name}!"
    else
      redirect_to invitation_acceptance_path(@invitation.token), alert: user.errors.full_messages.join(", ")
    end
  end

  private

  def set_invitation
    @invitation = Invitation.find_by(token: params[:token])
    ActsAsTenant.current_tenant = @invitation&.organization
  end

  def skip_pundit?
    true
  end
end
