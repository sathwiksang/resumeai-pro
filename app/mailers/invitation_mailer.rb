class InvitationMailer < ApplicationMailer
  def invite(invitation)
    @invitation = invitation
    @organization = invitation.organization
    @inviter = invitation.invited_by
    @accept_url = invitation_acceptance_url(invitation.token)

    mail(
      to: invitation.email,
      subject: "You've been invited to join #{@organization.name} on ResumeAI Pro"
    )
  end
end
