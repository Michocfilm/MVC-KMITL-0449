class AppController {
  constructor() {
    this.members = [];
    this.store = null;
    this.currentMemberId = null;
    this.selectedRequestId = null;
  }

  async init() {
    const data = await this._loadSeed();
    this._hydrate(data);
    this._bindUi();
    this.refresh();
  }

  async _loadSeed() {
    const res = await fetch("data/seed_data.json");
    if (!res.ok) {
      throw new Error("โหลด seed_data.json ไม่สำเร็จ");
    }
    return res.json();
  }

  _hydrate(data) {
    this.members = (data.members || []).map((m) => new Member(m));
    const votesByRequest = {};
    (data.decisions || []).forEach((d) => {
      if (!votesByRequest[d.request_id]) votesByRequest[d.request_id] = [];
      votesByRequest[d.request_id].push({
        memberId: d.member_id,
        result: d.result,
      });
    });
    const requests = (data.role_change_requests || []).map(
      (r) =>
        new ChangeRequest({
          id: r.id,
          requesterId: r.requester_id,
          targetId: r.target_id,
          newRole: r.new_role,
          status: r.status,
          votes: votesByRequest[r.id] || [],
        })
    );
    this.store = new ChangeRequestStore(requests);
    this.currentMemberId = this.members.length ? this.members[0].id : null;
  }

  _bindUi() {
    const currentSelect = document.getElementById("current-member");
    if (currentSelect) {
      currentSelect.addEventListener("change", (e) => {
        this.currentMemberId = e.target.value;
        this.refresh();
      });
    }

    const form = document.getElementById("create-request-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.createRequest();
      });
    }
  }

  _findMember(id) {
    return this.members.find((m) => m.id === id) || null;
  }

  _msg(message, type) {
    RequestView.showMessage(document.getElementById("message-box"), message, type);
  }

  refresh() {
    MemberView.renderTable(document.getElementById("members-body"), this.members);
    MemberView.fillMemberSelect(
      document.getElementById("current-member"),
      this.members,
      this.currentMemberId
    );
    MemberView.fillFormSelects(
      document.getElementById("proposer"),
      document.getElementById("target"),
      this.members
    );

    const proposerEl = document.getElementById("proposer");
    if (proposerEl && this.currentMemberId) {
      proposerEl.value = this.currentMemberId;
    }

    RequestView.renderList(
      document.getElementById("requests-body"),
      this.store.getAll(),
      this.members,
      this.currentMemberId,
      (id, result) => this.vote(id, result),
      (id) => this.cancelRequest(id),
      (id) => this.showDetail(id)
    );

    const selected = this.selectedRequestId
      ? this.store.findById(this.selectedRequestId)
      : null;
    RequestView.renderDetail(selected, this.members);
    RequestView.renderSummary(this.store, this.members);
    const label = document.getElementById("acting-as");
    if (label) {
      const m = this._findMember(this.currentMemberId);
      label.textContent = m
        ? "กำลังทำหน้าที่เป็น: " + m.name + " (" + m.id + ")"
        : "";
    }
  }

  createRequest() {
    const requesterId = document.getElementById("proposer").value;
    const targetId = document.getElementById("target").value;
    const newRole = document.getElementById("new-role").value;
    const result = this.store.create({ requesterId, targetId, newRole });
    if (!result.ok) {
      this._msg(result.error, "error");
      return;
    }
    this.selectedRequestId = result.request.id;
    this._msg(result.message, "success");
    this.refresh();
  }

  vote(requestId, result) {
    const request = this.store.findById(requestId);
    if (!request) {
      this._msg("ไม่พบคำขอ " + requestId, "error");
      return;
    }
    if (!this.currentMemberId) {
      this._msg("กรุณาเลือกสมาชิกที่กำลังทำหน้าที่ก่อนโหวต", "error");
      return;
    }
    const voter = this._findMember(this.currentMemberId);
    const target = this._findMember(request.targetId);
    const voteResult = request.addVote(this.currentMemberId, result, voter, target);
    if (!voteResult.ok) {
      this._msg(voteResult.error, "error");
      return;
    }
    this.selectedRequestId = requestId;
    this._msg(voteResult.message, "success");
    this.refresh();
  }

  cancelRequest(requestId) {
    const request = this.store.findById(requestId);
    if (!request) {
      this._msg("ไม่พบคำขอ " + requestId, "error");
      return;
    }
    if (this.currentMemberId !== request.requesterId) {
      this._msg("เฉพาะผู้สร้างคำขอเท่านั้นที่ยกเลิกได้", "error");
      return;
    }
    if (request.votes.length > 0) {
      this._msg("ยกเลิกไม่ได้ มีคนโหวตแล้ว", "error");
      return;
    }
    const result = request.cancel();
    if (!result.ok) {
      this._msg(result.error, "error");
      return;
    }
    this.selectedRequestId = requestId;
    this._msg("ยกเลิกคำขอ " + requestId + " สำเร็จ", "success");
    this.refresh();
  }
  showDetail(requestId) {
    this.selectedRequestId = requestId;
    this.refresh();
  }
}
