// Search the sample requests.
const search = document.querySelector("#search");
const cards = document.querySelectorAll(".card");
const clear = document.querySelector("#clear");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
function filterCards() {
  let visible = 0;
  cards.forEach(card => {
    card.hidden = !card.textContent.toLowerCase().includes(search.value.trim().toLowerCase());
    if (!card.hidden) visible++;
  });
  document.querySelector("#count").textContent = visible + (visible === 1 ? " sample request" : " sample requests");
  document.querySelector("#empty").hidden = visible > 0;
  clear.hidden = search.value.length === 0;
}
search.addEventListener("input", filterCards);
clear.addEventListener("click", () => {
  search.value = "";
  filterCards();
  search.focus();
});

// Choose an aid and move to the support form.
document.querySelectorAll("[data-aid]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelector("#donate").open = true;
    document.querySelector("#donationAid").value = button.dataset.aid;
    document.querySelector("#donate").scrollIntoView({ behavior: reducedMotion.matches ? "instant" : "smooth" });
    document.querySelector("#donationAid").focus({ preventScroll:true });
  });
});

// All forms use the same browser-only saving function.
document.querySelectorAll("form:not(#accountDemo)").forEach(form => {
  form.addEventListener("submit", event => {
    event.preventDefault();
    const message = form.querySelector(".message");
    const data = Object.fromEntries(new FormData(form));
    Object.keys(data).forEach(key => data[key] = data[key].trim());
    message.classList.add("error");
    if (Object.values(data).some(value => !value)) {
      message.textContent = "Please complete all fields, not just spaces.";
      return;
    }
    try {
      const saved = JSON.parse(localStorage.getItem(form.id) || "[]");
      if (!Array.isArray(saved)) throw new Error("Invalid saved data");
      saved.push({ ...data, savedAt:new Date().toISOString() });
      localStorage.setItem(form.id, JSON.stringify(saved));
      message.classList.remove("error");
      message.textContent = "Saved in this browser only. Nothing was sent online.";
      form.reset();
    } catch (error) {
      message.textContent = "Could not save. Check browser storage settings and try again.";
    }
  });
});


// Open a collapsed form when a navigation link points to it.
document.querySelectorAll('a[href="#donate"],a[href="#request"]').forEach(link => {
  link.addEventListener("click", () => {
    document.querySelector(link.getAttribute("href")).open = true;
  });
});
function openLinkedForm() {
  if (["#donate", "#request", "#handover"].includes(location.hash)) {
    document.querySelector(location.hash).open = true;
  }
}
window.addEventListener("hashchange", openLinkedForm);
openLinkedForm();


// Let the visitor remove only this project's demo entries.
document.querySelector("#deleteData").addEventListener("click", () => {
  if (!confirm("Delete the demo entries saved by this project?")) return;
  const message = document.querySelector("#deleteMessage");
  try {
    ["donationForm", "aidRequestForm", "handoverRecords", "contactMessages"].forEach(key => localStorage.removeItem(key));
    message.classList.remove("error");
    message.textContent = "Saved demo entries cleared.";
  } catch (error) {
    message.classList.add("error");
    message.textContent = "Could not clear entries. Check browser storage settings.";
  }
});


// Search also works with the button and Enter key.
document.querySelector("#searchButton").addEventListener("click", filterCards);
search.addEventListener("keydown", event => {
  if (event.key === "Enter") { event.preventDefault(); filterCards(); }
});

// Native dialogs support keyboard focus and Escape to close.
const account = document.querySelector("#accountDialog");
document.querySelectorAll("[data-account]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelector("#accountDemo").reset();
    account.querySelector(".message").textContent = "";
    document.querySelector("#accountTitle").textContent = button.dataset.account;
    document.querySelector("#accountAction").textContent = "Try " + button.dataset.account + " demo";
    account.showModal();
  });
});
document.querySelector("#accountDemo").addEventListener("submit", event => {
  event.preventDefault();
  account.querySelector(".message").textContent = "Demo complete. No account was created and no details were saved.";
  event.target.reset();
});
document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => button.closest("dialog").close());
});
const help = document.querySelector("#helpDialog");
document.querySelector("#helpButton").addEventListener("click", () => help.showModal());
document.querySelectorAll("[data-help]").forEach(button => {
  button.addEventListener("click", () => document.querySelector("#helpAnswer").textContent = button.dataset.help);
});
document.querySelector("#helpContact").addEventListener("click", () => help.close());