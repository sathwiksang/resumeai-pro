class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("MAIL_FROM", "no-reply@resume.sathwiksangeethamproject.dev")
  layout "mailer"
end
