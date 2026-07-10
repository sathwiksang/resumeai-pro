class JobDescriptionPolicy < ApplicationPolicy
  def show?
    true
  end

  def create?
    user.recruiter? || user.admin?
  end

  def update?
    user.admin? || owner?
  end

  def destroy?
    user.admin? || owner?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.all
    end
  end
end
