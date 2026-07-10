module Admin
  class InvitationsController < ApplicationController
    before_action :require_admin_or_recruiter

    def index
      invitations = policy_scope(Invitation).order(created_at: :desc)
      @pagy, @invitations = pagy(invitations)

      render inertia: "Admin/Invitations/Index", props: {
        invitations: @invitations.map { |i| serialize_invitation(i) },
        pagination: pagy_meta(@pagy),
        member_count: current_organization.users_count,
        member_limit: current_organization.plan_limits[:members],
      }
    end

    def create
      invitation = current_organization.invitations.build(invitation_params)
      invitation.invited_by = current_user
      authorize invitation

      unless current_organization.can_add_member?
        redirect_to admin_invitations_path, alert: "You've reached the team member limit for your #{current_organization.plan} plan."
        return
      end

      if invitation.save
        InvitationMailer.invite(invitation).deliver_later
        redirect_to admin_invitations_path, notice: "Invitation sent to #{invitation.email}."
      else
        redirect_to admin_invitations_path, alert: invitation.errors.full_messages.join(", ")
      end
    end

    def destroy
      invitation = Invitation.find(params[:id])
      authorize invitation

      if invitation.pending?
        invitation.destroy
        redirect_to admin_invitations_path, notice: "Invitation cancelled."
      else
        redirect_to admin_invitations_path, alert: "Only pending invitations can be cancelled."
      end
    end

    def resend
      invitation = Invitation.find(params[:id])
      authorize invitation

      if invitation.pending?
        invitation.update!(expires_at: 7.days.from_now)
        InvitationMailer.invite(invitation).deliver_later
        redirect_to admin_invitations_path, notice: "Invitation re-sent to #{invitation.email}."
      else
        redirect_to admin_invitations_path, alert: "Only pending invitations can be re-sent."
      end
    end

    private

    def require_admin_or_recruiter
      unless current_user&.admin? || current_user&.recruiter?
        redirect_to root_path, alert: "Access denied."
      end
    end

    def invitation_params
      params.require(:invitation).permit(:email, :role)
    end

    def serialize_invitation(invitation)
      {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        invited_by: invitation.invited_by&.full_name,
        expires_at: invitation.expires_at.iso8601,
        accepted_at: invitation.accepted_at&.iso8601,
        created_at: invitation.created_at.iso8601,
        # Deliverability fallback: admins can hand the accept link to the
        # invitee directly if the email doesn't arrive.
        invite_url: (invitation.pending? ? "#{request.protocol}#{request.host_with_port}/invitations/#{invitation.token}" : nil),
      }
    end
  end
end
