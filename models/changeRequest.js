class ChangeRequest {
  constructor({ id, requesterId, targetId, newRole, status, votes }) {
    this.id = id;
    this.requesterId = requesterId;
    this.targetId = targetId;
    this.newRole = newRole;
    this.status = status || "PENDING";
    this.votes = votes ? votes.slice() : [];
  }

  isPending() {
    return this.status === "PENDING";
  }

  countApprove() {
    return this.votes.filter((v) => v.result === "APPROVE").length;
  }

  countReject() {
    return this.votes.filter((v) => v.result === "REJECT").length;
  }

  hasVoted(memberId) {
    return this.votes.some((v) => v.memberId === memberId);
  }

  canCancel() {
    return this.isPending() && this.votes.length === 0;
  }

  cancel() {
    if (!this.canCancel()) {
      return {
        ok: false,
        error: "ยกเลิกไม่ได้ คำขอต้องยังไม่มีใครโหวต",
      };
    }
    this.status = "CANCELLED";
    return { ok: true };
  }

  addVote(memberId, result, voter, targetMember) {
    if (!this.isPending()) {
      return {
        ok: false,
        error: "โหวตไม่ได้: คำขอนี้ไม่ได้อยู่สถานะ PENDING แล้ว (" + this.status + ")",
      };
    }

    if (!voter) {
      return { ok: false, error: "โหวตไม่ได้: ไม่พบสมาชิกผู้โหวต" };
    }

    if (!voter.isActive()) {
      return { ok: false, error: "โหวตไม่ได้: สมาชิกต้องมีสถานะ Active" };
    }

    if (memberId === this.requesterId) {
      return { ok: false, error: "โหวตไม่ได้: ผู้สร้างคำขอไม่มีสิทธิ์โหวต" };
    }

    if (memberId === this.targetId) {
      return { ok: false, error: "โหวตไม่ได้: สมาชิกเป้าหมายไม่มีสิทธิ์โหวต" };
    }

    if (this.hasVoted(memberId)) {
      return { ok: false, error: "โหวตไม่ได้: คุณโหวตคำขอนี้ไปแล้ว" };
    }

    if (result !== "APPROVE" && result !== "REJECT") {
      return { ok: false, error: "โหวตไม่ได้: ผลโหวตต้องเป็น APPROVE หรือ REJECT" };
    }

    this.votes.push({ memberId, result });

    // ได้ 2 เสียง
    if (this.countApprove() >= 2) {
      this.status = "APPROVED";
      if (targetMember) {
        targetMember.changeRole(this.newRole);
      }
      return {
        ok: true,
        message: "คำขอได้รับการ อนุมัติ เปลี่ยนบทบาทเป้าหมายแล้ว",
      };
    }

    if (this.countReject() >= 2) {
      this.status = "REJECTED";
      return {
        ok: true,
        message: "คำขอ ไม่อนุมัติ บทบาทไม่เปลี่ยน",
      };
    }

    return { ok: true, message: "โหวตสำเร็จ" };
  }
}

class ChangeRequestStore {
  constructor(requests) {
    this.requests = requests || [];
    this._nextSeq = this._calcNextSeq();
  }

  _calcNextSeq() {
    let max = 0;
    this.requests.forEach((r) => {
      const n = parseInt(String(r.id).replace(/\D/g, ""), 10);
      if (!isNaN(n) && n > max) max = n;
    });
    return max + 1;
  }

  getAll() {
    return this.requests;
  }

  findById(id) {
    return this.requests.find((r) => r.id === id) || null;
  }

  hasPendingForTarget(targetId) {
    return this.requests.some(
      (r) => r.targetId === targetId && r.status === "PENDING"
    );
  }

  create({ requesterId, targetId, newRole }) {
    if (!requesterId || !targetId || !newRole) {
      return { ok: false, error: "สร้างคำขอไม่ได้: กรุณาเลือกผู้สร้างคำขอ เป้าหมาย และบทบาทใหม่" };
    }

    if (requesterId === targetId) {
      return {
        ok: false,
        error: "สร้างคำขอไม่ได้: ผู้สร้างต้องไม่ใช่คนเดียวกับสมาชิกเป้าหมาย",
      };
    }

    if (this.hasPendingForTarget(targetId)) {
      return {
        ok: false,
        error:
          "สร้างคำขอไม่ได้: สมาชิกเป้าหมายมีคำขอสถานะ PENDING อยู่แล้ว",
      };
    }

    const id = "C" + String(this._nextSeq).padStart(2, "0");
    this._nextSeq += 1;

    const request = new ChangeRequest({
      id,
      requesterId,
      targetId,
      newRole,
      status: "PENDING",
      votes: [],
    });

    this.requests.push(request);
    return { ok: true, request, message: "สร้างคำขอ " + id + " สำเร็จ" };
  }

  groupByStatus() {
    const groups = {
      PENDING: [],
      APPROVED: [],
      REJECTED: [],
      CANCELLED: [],
    };
    this.requests.forEach((r) => {
      if (groups[r.status]) {
        groups[r.status].push(r);
      }
    });
    return groups;
  }
}
