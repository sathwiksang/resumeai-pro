class ApplicationPolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = user
    @record = record
  end

  def index?
    true
  end

  def show?
    true
  end

  def new?
    create?
  end

  def create?
    user.recruiter? || user.admin?
  end

  def edit?
    update?
  end

  def update?
    user.admin? || owner?
  end

  def destroy?
    user.admin?
  end

  private

  def owner?
    record.respond_to?(:user_id) && record.user_id == user.id
  end

  def organization_member?
    user.organization_id == record.organization_id
  end

  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve
      scope.all
    end
  end
end
