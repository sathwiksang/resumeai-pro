# Route constraint that admits a request only when the signed session cookie
# resolves to a live session whose user is an admin. Used to gate the
# Mission Control jobs dashboard, which has no auth of its own.
class AdminSessionConstraint
  def matches?(request)
    session_id = request.cookie_jar.signed[:session_id]
    return false if session_id.blank?

    session = Session.find_by(id: session_id)
    session&.user&.admin? || false
  end
end
