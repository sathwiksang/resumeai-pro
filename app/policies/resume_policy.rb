class ResumePolicy < ApplicationPolicy
  def show?
    user.recruiter? || user.admin? || owner?
  end

  def create?
    true
  end

  def update?
    user.admin? || owner?
  end

  def destroy?
    user.admin? || owner?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user.recruiter? || user.admin?
        scope.all
      else
        scope.where(user: user)
      end
    end
  end
end
