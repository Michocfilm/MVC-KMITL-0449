const RequestView = {
  showMessage(el, message, type) {
    if (!el) return;
    el.textContent = message || "";
    el.className = "msg msg-" + (type || "info");
    if (!message) el.className = "msg";
  },

  renderList(tbody, requests, members, currentMemberId, onVote, onCancel, onSelectDetail) {
    if (!tbody) return;
    tbody.innerHTML = "";

    const nameOf = (id) => {
      const m = members.find((x) => x.id === id);
      return m ? m.name + " (" + m.id + ")" : id;
    };

    requests.forEach((r) => {
      const tr = document.createElement("tr");
      const tdId = document.createElement("td");
      const idBtn = document.createElement("button");
      idBtn.type = "button";
      idBtn.className = "link-btn";
      idBtn.textContent = r.id;
      idBtn.addEventListener("click", () => onSelectDetail(r.id));
      tdId.appendChild(idBtn);

      const tdProposer = document.createElement("td");
      tdProposer.textContent = nameOf(r.requesterId);
      const tdTarget = document.createElement("td");
      tdTarget.textContent = nameOf(r.targetId);
      const tdRole = document.createElement("td");
      tdRole.textContent = r.newRole;
      const tdStatus = document.createElement("td");
      tdStatus.textContent = r.status;
      const tdApprove = document.createElement("td");
      tdApprove.textContent = String(r.countApprove());
      const tdReject = document.createElement("td");
      tdReject.textContent = String(r.countReject());
      const tdActions = document.createElement("td");
      if (r.isPending() && currentMemberId) {
        const approveBtn = document.createElement("button");
        approveBtn.type = "button";
        approveBtn.textContent = "อนุมัติ";
        approveBtn.addEventListener("click", () => onVote(r.id, "APPROVE"));

        const rejectBtn = document.createElement("button");
        rejectBtn.type = "button";
        rejectBtn.textContent = "ไม่อนมัติ";
        rejectBtn.addEventListener("click", () => onVote(r.id, "REJECT"));

        tdActions.appendChild(approveBtn);
        tdActions.appendChild(document.createTextNode(" "));
        tdActions.appendChild(rejectBtn);
      }

      if (r.isPending() && currentMemberId === r.requesterId) {
        const cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.textContent = "ยกเลิกคำขอ";
        cancelBtn.addEventListener("click", () => onCancel(r.id));
        tdActions.appendChild(document.createTextNode(" "));
        tdActions.appendChild(cancelBtn);
      }

      tr.appendChild(tdId);
      tr.appendChild(tdProposer);
      tr.appendChild(tdTarget);
      tr.appendChild(tdRole);
      tr.appendChild(tdStatus);
      tr.appendChild(tdApprove);
      tr.appendChild(tdReject);
      tr.appendChild(tdActions);
      tbody.appendChild(tr);
    });
  },

  renderDetail(request, members) {
    const emptyEl = document.getElementById("detail-empty");
    const contentEl = document.getElementById("detail-content");
    const idEl = document.getElementById("detail-id");
    if (!request) {
      if (emptyEl) emptyEl.hidden = false;
      if (contentEl) contentEl.hidden = true;
      if (idEl) idEl.textContent = "";
      return;
    }

    const nameOf = (id) => {
      const m = members.find((x) => x.id === id);
      return m ? m.name + " (" + m.id + ", " + m.role + ")" : id;
    };

    if (emptyEl) emptyEl.hidden = true;
    if (contentEl) contentEl.hidden = false;
    if (idEl) idEl.textContent = request.id;
    setText("detail-proposer", nameOf(request.requesterId));
    setText("detail-target", nameOf(request.targetId));
    setText("detail-new-role", request.newRole);
    setText("detail-status", request.status);
    setText("detail-approve-count", String(request.countApprove()));
    setText("detail-reject-count", String(request.countReject()));
    const votesEmpty = document.getElementById("detail-votes-empty");
    const votesTable = document.getElementById("detail-votes-table");
    const votesBody = document.getElementById("detail-votes-body");
    if (!votesBody) return;
    votesBody.innerHTML = "";
    if (request.votes.length === 0) {
      if (votesEmpty) votesEmpty.hidden = false;
      if (votesTable) votesTable.hidden = true;
      return;
    }
    if (votesEmpty) votesEmpty.hidden = true;
    if (votesTable) votesTable.hidden = false;

    request.votes.forEach((v) => {
      const tr = document.createElement("tr");
      const tdMember = document.createElement("td");
      tdMember.textContent = nameOf(v.memberId);
      const tdResult = document.createElement("td");
      tdResult.textContent = v.result;
      tr.appendChild(tdMember);
      tr.appendChild(tdResult);
      votesBody.appendChild(tr);
    });
  },

  renderSummary(store, members) {
    const groups = store.groupByStatus();
    const nameOf = (id) => {
      const m = members.find((x) => x.id === id);
      return m ? m.name + " (" + m.id + ")" : id;
    };
    const roleOf = (id) => {
      const m = members.find((x) => x.id === id);
      return m ? m.role : "-";
    };

    document.querySelectorAll(".summary-group").forEach((groupEl) => {
      const status = groupEl.getAttribute("data-status");
      const list = groups[status] || [];
      const countEl = groupEl.querySelector(".summary-count");
      const emptyEl = groupEl.querySelector(".summary-empty");
      const tableEl = groupEl.querySelector(".summary-table");
      const bodyEl = groupEl.querySelector(".summary-body");
      if (countEl) countEl.textContent = String(list.length);
      if (!bodyEl) return;
      bodyEl.innerHTML = "";
      if (list.length === 0) {
        if (emptyEl) emptyEl.hidden = false;
        if (tableEl) tableEl.hidden = true;
        return;
      }
      if (emptyEl) emptyEl.hidden = true;
      if (tableEl) tableEl.hidden = false;
      list.forEach((r) => {
        const tr = document.createElement("tr");
        [
          r.id,
          nameOf(r.requesterId),
          nameOf(r.targetId),
          r.newRole,
          String(r.countApprove()),
          String(r.countReject()),
          roleOf(r.requesterId),
          roleOf(r.targetId),
        ].forEach((text) => {
          const td = document.createElement("td");
          td.textContent = text;
          tr.appendChild(td);
        });
        bodyEl.appendChild(tr);
      });
    });
  },
};

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
