const MemberView = {
  renderTable(tbody, members) {
    if (!tbody) return;
    tbody.innerHTML = "";
    members.forEach((m) => {
      const tr = document.createElement("tr");
      tr.innerHTML = "<td>" + escapeHtml(m.id) + "</td>" + "<td>" + escapeHtml(m.name) + "</td>" +
      "<td>" + escapeHtml(m.role) + "</td>" + "<td>" + escapeHtml(m.getStatusLabel()) +"</td>";
      tbody.appendChild(tr);
    });
  },
  fillMemberSelect(selectEl, members, currentId) {
    if (!selectEl) return;
    selectEl.innerHTML = "";
    members.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = m.id + " — " + m.name + " (" + m.role + ")";
      if (m.id === currentId) opt.selected = true;
      selectEl.appendChild(opt);
    });
  },

  fillFormSelects(proposerSelect, targetSelect, members) {
    const fill = (el) => {
      if (!el) return;
      el.innerHTML = "<option value=''>-- เลือก --</option>";
      members.forEach((m) => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = m.id + " — " + m.name + " (" + m.role + ")";
        el.appendChild(opt);
      });
    };
    fill(proposerSelect);
    fill(targetSelect);
  },
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
