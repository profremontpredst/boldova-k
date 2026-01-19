// === MODAL OPEN/CLOSE (UI) ===
const modal = document.getElementById('modal');
const openModalButtons = document.querySelectorAll('.open-modal');
const closeModalButton = document.querySelector('.close-modal');
const burger = document.querySelector('.burger');
const navMenu = document.querySelector('.nav-menu');

function resetForm() {
  document.getElementById("smart-form").style.display = "block";
  document.getElementById("receiving-screen").style.display = "none";
  document.getElementById("thanks-screen").style.display = "none";
  document.getElementById("contact-form").reset();
  document.getElementById("sendBtn").disabled = false;
  document.getElementById("status").textContent = "";
}

// Открытие модалки
openModalButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    resetForm();
  });
});

// Закрытие модалки
closeModalButton.addEventListener('click', () => {
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
  resetForm();
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    resetForm();
  }
});

// === MASKS ===
const phoneInput = document.getElementById("phone");
if (phoneInput) {
  IMask(phoneInput, { mask: '+{7} (000) 000-00-00' });
}

const phone2 = document.getElementById("quizPhone");
if (phone2) {
  IMask(phone2, { mask: '+{7} (000) 000-00-00' });
}

// === MODAL FORM SUBMIT ===
document.getElementById("contact-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = phoneInput?.value ? phoneInput.value.replace(/[^0-9+]/g, '') : '';
  const honeypot = document.getElementById("honeypot").value;
  const status = document.getElementById("status");
  const btn = document.getElementById("sendBtn");

  if (honeypot) return;

  if (!name || !(phone.startsWith("+7") && phone.length === 12)) {
    status.textContent = "Введите корректные данные";
    return;
  }

  btn.disabled = true;
  status.textContent = "Проверяем…";

  try {
    if (!window.GigaBot || typeof window.GigaBot.send !== "function") {
      throw new Error("GigaBot not loaded");
    }

    // 1) АНТИБОТ
    const result = await window.GigaBot.send({
      type: "form",
      fields: { name, phone, honeypot }
    });

    // 2) DENY/BLOCK — делаем вид что всё ок
    if (result.action !== "allow" && result.action !== "challenge") {
      document.getElementById("smart-form").style.display = "none";
      document.getElementById("receiving-screen").style.display = "block";

      setTimeout(() => {
        document.getElementById("receiving-screen").style.display = "none";
        document.getElementById("thanks-screen").style.display = "block";

        setTimeout(() => {
          modal.style.display = "none";
          document.body.style.overflow = "auto";
          resetForm();
        }, 3000);
      }, 1200);

      return;
    }

    // 4) UI как в оригинале
    document.getElementById("smart-form").style.display = "none";
    document.getElementById("receiving-screen").style.display = "block";

    setTimeout(() => {
      document.getElementById("receiving-screen").style.display = "none";
      document.getElementById("thanks-screen").style.display = "block";

      setTimeout(() => {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
        resetForm();
      }, 3000);
    }, 1200);

  } catch (err) {
    console.error(err);
    status.textContent = "Ошибка, попробуйте позже";
    btn.disabled = false;
  }
});

// === FAQ ===
document.querySelectorAll('.faq-question').forEach(question => {
  question.addEventListener('click', () => {
    const faqItem = question.parentElement;
    const isActive = faqItem.classList.contains('faq-active');

    document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('faq-active'));
    if (!isActive) faqItem.classList.add('faq-active');
  });
});

// === SMOOTH SCROLL + CLOSE MENU ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');

    // Защита от пустых ссылок
    if (!href || href === "#") return;

    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (navMenu.classList.contains('nav-active')) {
        navMenu.classList.remove('nav-active');
        burger.classList.remove('toggle');
        document.body.style.overflow = 'auto';
      }
    }
  });
});

// === HEADER ON SCROLL ===
window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (window.scrollY > 100) {
    header.style.background = 'rgba(5,6,8,.78)';
    header.style.backdropFilter = 'blur(14px)';
    header.style.boxShadow = '0 12px 45px rgba(0,0,0,.55)';
    header.style.borderBottom = '1px solid rgba(255,255,255,.08)';
  } else {
    header.style.background = 'rgba(5,6,8,.72)';
    header.style.backdropFilter = 'blur(14px)';
    header.style.boxShadow = '0 8px 40px rgba(0,0,0,.55)';
    header.style.borderBottom = '1px solid rgba(255,255,255,.06)';
  }
});

// === BURGER MENU ===
burger.addEventListener('click', () => {
  navMenu.classList.toggle('nav-active');
  burger.classList.toggle('toggle');

  document.body.style.overflow = navMenu.classList.contains('nav-active') ? 'hidden' : 'auto';
});

// === INTERSECTION ANIMATIONS ===
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = 1;
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.stat-card, .feature, .contact-item').forEach(el => {
  el.style.opacity = 0;
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// === QUIZ LOGIC ===
let step = 1, total = 5;
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const steps = $$(".step");
const pBar = $("#pBar");

const answers = {};
const hidden = {
  debt: $("#quizDebt"),
  delay: $("#quizDelay"),
  job: $("#quizJob"),
  property: $("#quizProperty")
};

function showStep(n) {
  steps.forEach(s => s.style.display = "none");
  steps[n-1].style.display = "block";
  pBar.style.width = ((n-1)/(total-1))*100 + "%";
  step = n;
}

$$(".btn-opt").forEach(btn => {
  btn.addEventListener("click", () => {
    const name = btn.dataset.name, val = btn.dataset.value;

    btn.parentElement.querySelectorAll(".btn-opt").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    answers[name] = val;
    if (hidden[name]) hidden[name].value = val;

    if (step < total) showStep(++step);
  });
});

// QUIZ FORM SUBMIT
const quizForm = document.getElementById("quizForm");
const autoHint = document.getElementById("autoHint");
const quizPhone = document.getElementById("quizPhone");
const quizName = document.getElementById("quizName");
const quizHoneypot = document.getElementById("quizHoneypot");

quizForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (autoHint) autoHint.style.display = "block";

  const name = quizName.value.trim();
  const phone = quizPhone?.value ? quizPhone.value.replace(/[^0-9+]/g, '') : '';
  const honeypot = quizHoneypot.value;

  if (honeypot) return;

  if (!name || !(phone.startsWith("+7") && phone.length === 12)) return;

  try {
    if (!window.GigaBot || typeof window.GigaBot.send !== "function") {
      throw new Error("GigaBot not loaded");
    }

    // ответы берём из hidden
    const fields = {
      name,
      phone,
      honeypot,
      debt: hidden.debt.value || "",
      delay: hidden.delay.value || "",
      job: hidden.job.value || "",
      property: hidden.property.value || ""
    };

    // 1) АНТИБОТ
    const result = await window.GigaBot.send({
      type: "quiz",
      fields
    });

    // 2) DENY/BLOCK — показываем "спасибо" и НЕ шлём лид
    if (result.action !== "allow" && result.action !== "challenge") {
      steps.forEach(s => s.style.display = "none");
      if (autoHint) autoHint.style.display = "none";
      document.getElementById("thanksBox").style.display = "block";
      return;
    }

    // UI “спасибо”
    steps.forEach(s => s.style.display = "none");
    if (autoHint) autoHint.style.display = "none";
    document.getElementById("thanksBox").style.display = "block";

  } catch (err) {
    console.error(err);
    if (autoHint) autoHint.textContent = "Ошибка, попробуйте позже";
  }
});

// Инициализация квиза
showStep(1);

// === UTM SAVE ===
(function() {
  const params = new URLSearchParams(window.location.search);
  const utm = {
    source: params.get("utm_source") || "",
    campaign: params.get("utm_campaign") || "",
    term: params.get("utm_term") || "",
    geo: params.get("utm_geo") || params.get("utm_region") || ""
  };
  localStorage.setItem("UTM", JSON.stringify(utm));
})();
