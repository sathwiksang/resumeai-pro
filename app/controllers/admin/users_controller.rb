module Admin
  class UsersController < ApplicationController
    before_action :require_admin
    before_action :set_user, only: [:show, :edit, :update, :destroy]

    def index
      users = policy_scope(current_organization.users).order(created_at: :desc)
      @pagy, @users = pagy(users, limit: 20)

      render inertia: "Admin/Users/Index", props: {
        users: @users.map { |u| serialize_user(u) },
        pagination: pagy_meta(@pagy),
      }
    end

    def show
      authorize @user
      render inertia: "Admin/Users/Show", props: {
        user: serialize_user(@user, detailed: true),
      }
    end

    def new
      authorize User
      render inertia: "Admin/Users/New"
    end

    def create
      return unless enforce_member_limit!

      user = current_organization.users.build(user_params)
      authorize user

      if user.save
        redirect_to admin_users_path, notice: "#{user.full_name} has been invited."
      else
        redirect_to new_admin_user_path, alert: user.errors.full_messages.join(", ")
      end
    end

    def edit
      authorize @user
      render inertia: "Admin/Users/Edit", props: {
        user: serialize_user(@user),
      }
    end

    def update
      authorize @user

      if @user.update(user_params)
        redirect_to admin_users_path, notice: "User updated."
      else
        redirect_to edit_admin_user_path(@user), alert: @user.errors.full_messages.join(", ")
      end
    end

    def destroy
      authorize @user

      if @user == current_user
        redirect_to admin_users_path, alert: "You cannot delete your own account."
      else
        @user.destroy
        redirect_to admin_users_path, notice: "User removed."
      end
    end

    private

    def require_admin
      unless current_user&.admin?
        redirect_to root_path, alert: "Admin access required."
      end
    end

    # Scope to the current organization — User is not acts_as_tenant, so a
    # bare User.find would reach across tenants. Missing/foreign ids 404.
    def set_user
      @user = current_organization.users.find(params[:id])
    end

    def user_params
      params.require(:user).permit(:first_name, :last_name, :email_address, :role, :password, :password_confirmation)
    end

    def serialize_user(user, detailed: false)
      data = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email_address: user.email_address,
        role: user.role,
        avatar_url: user.avatar_url,
        created_at: user.created_at.iso8601,
      }

      if detailed
        data.merge!(
          resumes_count: user.resumes.count,
          scores_count: user.resume_scores.count,
          last_active_at: user.sessions.order(created_at: :desc).first&.created_at&.iso8601,
        )
      end

      data
    end
  end
end
