class Member {
  constructor({ id, name, role, active }) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.active = active === true;
  }

  getStatusLabel() {
    return this.active ? "Active" : "Inactive";
  }

  isActive() {
    return this.active === true;
  }

  changeRole(newRole) {
    this.role = newRole;
  }

  canVoteOn(request) {
    if (!this.isActive()) return false;
    if (this.id === request.requesterId) return false;
    if (this.id === request.targetId) return false;
    return true;
  }
}
