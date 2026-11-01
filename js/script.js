
/* ==========================================
   SCROLL-TRIGGERED ANIMATION SYSTEM
   Animations play when sections enter view
   They reset when you leave and replay on return
========================================== */

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

function observeSection(element, onEnter, onLeave) {
  if (!element) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        onEnter();
      } else if (onLeave) {
        onLeave();
      }
    });
  }, {
    threshold: 0.15
  });

  observer.observe(element);
  return observer;
}

/* ==========================================
   HERO ANIMATION
   Only plays when website loads
========================================== */

const hero = document.querySelector("#hero");

if (hero) {
  window.addEventListener("DOMContentLoaded", () => {
    requestAnimationFrame(() => {
      hero.classList.add("is-entering");
    });
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "r" && hero) {
    hero.classList.remove("is-entering");
    void hero.offsetWidth;
    hero.classList.add("is-entering");
  }
});

/* ==========================================
   FOOTER ANIMATION
========================================== */

const nkcFooter = document.querySelector(".nkc-footer");

observeSection(
  nkcFooter,
  () => {
    nkcFooter.classList.add("nkc-footer-visible");
  },
  () => {
    nkcFooter.classList.remove("nkc-footer-visible");
  }
);

/* ==========================================
   ROTATING HEADING
   Only rotates while visible
========================================== */

const rotatingTitle = document.getElementById("rotating-title");

const titleWords = [
  "BIG JUGAAD.",
  "BOLD IDEAS.",
  "FAST BUILDS.",
  "SMART DESIGN.",
  "REAL RESULTS."
];

let currentTitleIndex = 0;
let rotatingInterval = null;
let titleTimeout = null;

function changeRotatingTitle() {
  if (!rotatingTitle) return;

  rotatingTitle.classList.remove("entering");
  rotatingTitle.classList.add("leaving");

  clearTimeout(titleTimeout);

  titleTimeout = setTimeout(() => {
    currentTitleIndex =
      (currentTitleIndex + 1) % titleWords.length;

    rotatingTitle.textContent = titleWords[currentTitleIndex];

    rotatingTitle.classList.remove("leaving");
    rotatingTitle.classList.add("entering");
  }, 300);
}

observeSection(
  rotatingTitle,
  () => {
    if (!rotatingInterval && !prefersReducedMotion) {
      rotatingInterval = setInterval(changeRotatingTitle, 5000);
    }
  },
  () => {
    clearInterval(rotatingInterval);
    rotatingInterval = null;
    clearTimeout(titleTimeout);
  }
);

/* ==========================================
   MOBILE MENU
========================================== */

const menuButton = document.querySelector(".menu-button");
const desktopNav = document.querySelector(".desktop-nav");

if (menuButton && desktopNav) {
  menuButton.addEventListener("click", () => {
    desktopNav.classList.toggle("mobile-open");

    menuButton.textContent =
      desktopNav.classList.contains("mobile-open")
        ? "CLOSE"
        : "MENU";
  });
}

/* ==========================================
   MARQUEE
   Pause when outside viewport
========================================== */

const marquee = document.querySelector(".marquee");
const track = document.querySelector("#marqueeTrack");

const marqueeItems = [
  "ELECTRONIC PLATFORM SCALES",
  "RETAIL COMMERCIAL INDUSTRIAL",
  "DIGITAL WEIGHING MACHINE",
  "AFTER SALES SUPPORT"
];

function addSequence(group) {
  marqueeItems.forEach((text, index) => {
    const item = document.createElement("span");
    item.className = "marquee__item";
    item.textContent = text;
    group.appendChild(item);

    if (index < marqueeItems.length - 1) {
      const star = document.createElement("span");
      star.className = "marquee__star";
      star.textContent = "✦";
      star.setAttribute("aria-hidden", "true");
      group.appendChild(star);
    }
  });
}

function buildMarquee() {
  if (!marquee || !track) return;

  track.innerHTML = "";

  const group = document.createElement("div");
  group.className = "marquee__group";
  track.appendChild(group);

  while (group.scrollWidth < marquee.clientWidth * 2) {
    addSequence(group);
  }

  const copy = group.cloneNode(true);
  copy.setAttribute("aria-hidden", "true");
  track.appendChild(copy);
}

if (marquee && track) {
  buildMarquee();

  if ("ResizeObserver" in window) {
    new ResizeObserver(buildMarquee).observe(marquee);
  }

  observeSection(
    marquee,
    () => {
      track.style.animationPlayState = "running";
    },
    () => {
      track.style.animationPlayState = "paused";
    }
  );
}

/* ==========================================
   FAQ
========================================== */

document.querySelectorAll(".nkc-faq").forEach(section => {
  const faqItems = section.querySelectorAll(".nkc-faq-item");

  faqItems.forEach(item => {
    const button = item.querySelector(".nkc-faq-question");

    if (!button) return;

    button.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      faqItems.forEach(faq => {
        faq.classList.remove("active");

        faq.querySelector(".nkc-faq-question")
          ?.setAttribute("aria-expanded", "false");
      });

      if (!isActive) {
        item.classList.add("active");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });
});

/* ==========================================
   STATISTICS
   Counts start when you reach the section
   Reset when you leave
========================================== */

const statItems = document.querySelectorAll(".stat-item");

function animateNumber(element) {
  const target = Number(element.dataset.target);
  const suffix = element.dataset.suffix || "";
  const duration = 1500;
  const startTime = performance.now();

  function updateNumber(currentTime) {
    const progress = Math.min(
      (currentTime - startTime) / duration,
      1
    );

    const easedProgress = 1 - Math.pow(1 - progress, 4);
    const currentNumber = Math.floor(target * easedProgress);

    element.textContent = currentNumber + suffix;

    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    } else {
      element.textContent = target + suffix;
    }
  }

  requestAnimationFrame(updateNumber);
}

statItems.forEach(item => {
  const number = item.querySelector(".stat-number");

  observeSection(
    item,
    () => {
      item.classList.add("visible");

      if (number && !prefersReducedMotion) {
        animateNumber(number);
      } else if (number) {
        number.textContent =
          number.dataset.target + (number.dataset.suffix || "");
      }
    },
    () => {
      item.classList.remove("visible");

      if (number) {
        number.textContent = "0" + (number.dataset.suffix || "");
      }
    }
  );
});

/* ==========================================
   SCRATCH WIDGET
   Initialise only when it enters the screen
========================================== */

const scratchRoot = document.getElementById("scratchWidget");

if (scratchRoot) {
  observeSection(scratchRoot, () => {
    scratchRoot.classList.add("scratch-in-view");

    if (scratchRoot.dataset.ready !== "true") {
      scratchRoot.dataset.ready = "true";
      initializeScratchWidget(scratchRoot);
    }
  });
}

function initializeScratchWidget(root) {
  const stage = root.querySelector("#scratchStage");
  const canvas = root.querySelector("#scratchCanvas");
  const status = root.querySelector("#scratchStatus");
  const revealButton = root.querySelector("#scratchReveal");
  const resetButton = root.querySelector("#scratchReset");

  if (!stage || !canvas || !status || !revealButton || !resetButton) {
    return;
  }

  const ctx = canvas.getContext("2d", {
    willReadFrequently: true
  });

  if (!ctx) return;

  let scratching = false;
  let revealed = false;
  let lastPoint = null;
  let measureTimer = 0;

  const sample = document.createElement("canvas");
  sample.width = 64;
  sample.height = 36;

  const sampleCtx = sample.getContext("2d", {
    willReadFrequently: true
  });

  function paintLayer() {
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.fillStyle = "#f43d08";
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, rect.width, rect.height);
    ctx.clip();

    ctx.translate(rect.width / 2, rect.height / 2);
    ctx.rotate(Math.PI / 4);

    const span = Math.hypot(rect.width, rect.height) * 2;

    ctx.fillStyle = "rgba(255,190,70,0.13)";

    for (let x = -span; x < span; x += 43) {
      ctx.fillRect(x, -span, 18, span * 2);
    }

    ctx.restore();

    const sheen = ctx.createLinearGradient(
      0, 0, rect.width, rect.height
    );

    sheen.addColorStop(0, "rgba(255,255,255,0.04)");
    sheen.addColorStop(0.52, "rgba(255,255,255,0)");
    sheen.addColorStop(1, "rgba(117,17,0,0.04)");

    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, rect.width, rect.height);
  }

  function setStatus(message, complete = false) {
    status.textContent = "●  " + message;
    status.style.color = complete ? "#426345" : "#5b554c";
  }

  function getPoint(event) {
    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function erase(point) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 62;

    ctx.beginPath();
    ctx.arc(point.x, point.y, 31, 0, Math.PI * 2);
    ctx.fill();

    if (lastPoint) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }

    ctx.restore();
    lastPoint = point;
  }

  function revealCards() {
    if (revealed) return;

    revealed = true;
    scratching = false;
    lastPoint = null;

    root.classList.add("is-revealed");
    revealButton.hidden = true;
    resetButton.hidden = false;

    setStatus("Three good things, now in the open.", true);
  }

  function measureProgress() {
    if (revealed || !sampleCtx) return;

    sampleCtx.clearRect(0, 0, sample.width, sample.height);
    sampleCtx.drawImage(canvas, 0, 0, sample.width, sample.height);

    const pixels = sampleCtx.getImageData(
      0, 0, sample.width, sample.height
    ).data;

    let erased = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 100) erased++;
    }

    const percent = erased / (sample.width * sample.height);

    if (percent >= 0.38) {
      revealCards();
    } else if (percent > 0.01) {
      setStatus(
        `Keep going — ${Math.round(percent / 0.38 * 100)}% revealed`
      );
      resetButton.hidden = false;
    }
  }

  function scheduleMeasure() {
    if (measureTimer) return;

    measureTimer = requestAnimationFrame(() => {
      measureTimer = 0;
      measureProgress();
    });
  }

  canvas.addEventListener("pointerdown", event => {
    if (revealed || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);

    scratching = true;
    lastPoint = null;

    erase(getPoint(event));
    scheduleMeasure();
  });

  canvas.addEventListener("pointermove", event => {
    if (!scratching || revealed) return;

    erase(getPoint(event));
    scheduleMeasure();
  });

  function stopScratching() {
    if (!scratching) return;

    scratching = false;
    lastPoint = null;
    scheduleMeasure();
  }

  canvas.addEventListener("pointerup", stopScratching);
  canvas.addEventListener("pointercancel", stopScratching);
  canvas.addEventListener("lostpointercapture", stopScratching);

  revealButton.addEventListener("click", revealCards);

  resetButton.addEventListener("click", () => {
    scratching = false;
    revealed = false;
    lastPoint = null;

    root.classList.remove("is-revealed");
    revealButton.hidden = false;
    resetButton.hidden = true;

    setStatus("Go on. We made this part fun.");
    paintLayer();
  });

  paintLayer();

  if ("ResizeObserver" in window) {
    new ResizeObserver(paintLayer).observe(stage);
  } else {
    window.addEventListener("resize", paintLayer);
  }
}

/* ==========================================
   CONTACT FORM
========================================== */

const nkcContactForm = document.querySelector("#nkcContactForm");

if (nkcContactForm) {
  nkcContactForm.addEventListener("submit", event => {
    event.preventDefault();

    if (!nkcContactForm.reportValidity()) return;

    const formData = new FormData(nkcContactForm);

    const name = formData.get("name").trim();
    const business = formData.get("business").trim() || "Not provided";
    const product = formData.get("product");
    const message = formData.get("message").trim();

    const subject = `Product enquiry from ${name}`;

    const body = [
      `Name: ${name}`,
      `Business/application: ${business}`,
      `Enquiry: ${product}`,
      "",
      "Requirements:",
      message
    ].join("\n");

    window.location.href =
      `mailto:newkochcompany@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

/* ==========================================
   WHATSAPP
========================================== */

const whatsappNumber = "YOUR_WHATSAPP_NUMBER_HERE";

const defaultMessage =
  "Hello, I’m interested in weighing equipment. Could you help me find a suitable option?";

const targetUrl =
  `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

document.querySelectorAll(
  ".btn-whatsapp, .floating-whatsapp-btn"
).forEach(link => {
  link.addEventListener("click", () => {
    if (whatsappNumber === "YOUR_WHATSAPP_NUMBER_HERE") {
      console.warn("WhatsApp number placeholder has not been replaced yet.");
    }
  });
});

/* ==========================================
   PRODUCT GALLERY 1
========================================== */

const products = [
  {
    name: "Weighing Scale",
    image: "https://5.imimg.com/data5/ANDROID/Default/2025/8/537511350/YM/OZ/JT/3458543/product-jpeg-125x125.jpg",
    category: "PRECISION WEIGHING SYSTEMS",
    description: "Explore precision weighing equipment designed to deliver reliable and consistent measurements across different weighing applications."
  },
  {
    name: "Platform Scale",
    image: "https://5.imimg.com/data5/ANDROID/Default/2025/8/537513737/DB/NC/NZ/3458543/product-jpeg-125x125.jpg",
    category: "INDUSTRIAL WEIGHING SYSTEMS",
    description: "Discover platform weighing solutions designed for industrial applications and dependable everyday weighing requirements."
  },
  {
    name: "Counting Scale",
    image: "https://5.imimg.com/data5/ANDROID/Default/2022/12/TX/BR/QX/3458543/product-jpeg-125x125.jpg",
    category: "DIGITAL COUNTING SYSTEMS",
    description: "Explore counting scale solutions for accurate quantity measurement and efficient inventory-related weighing applications."
  },
  {
    name: "Laboratory Scale",
    image: "https://5.imimg.com/data5/GLADMIN/Default/2021/11/CT/WI/PH/3458543/laboratory-scale-125x125.jpeg",
    category: "LABORATORY EQUIPMENT",
    description: "Precision weighing instruments designed for laboratory environments and measurement-focused applications."
  },
  {
    name: "Electronic Scale",
    image: "https://5.imimg.com/data5/EK/MS/OK/SELLER-3458543/electronic-salter-scale-125x125.jpg",
    category: "ELECTRONIC WEIGHING",
    description: "Explore electronic weighing solutions combining digital measurement technology with convenient operation."
  },
  {
    name: "Load Cell",
    image: "https://5.imimg.com/data5/SELLER/Default/2022/2/YI/JX/UV/3458543/weighbridge-load-cell-125x125.jpg",
    category: "INDUSTRIAL COMPONENTS",
    description: "Discover load cell components designed for weighing systems and industrial measurement applications."
  },
  {
    name: "Bench Scale",
    image: "https://5.imimg.com/data5/SELLER/Default/2021/11/MS/MI/QF/3458543/bench-model-125x125.jpeg",
    category: "BENCH WEIGHING SYSTEMS",
    description: "Explore compact bench weighing equipment suitable for various commercial and industrial weighing requirements."
  },
  {
    name: "Hanging Scale",
    image: "https://5.imimg.com/data5/SELLER/Default/2021/10/RC/EF/JQ/3458543/hanging-scale-125x125.jpg",
    category: "SPECIALIZED WEIGHING",
    description: "Discover hanging weighing equipment designed for weighing applications where suspended measurement is required."
  },
  {
    name: "Table Top Scale",
    image: "https://5.imimg.com/data5/ANDROID/Default/2025/8/541200363/AI/NG/CC/3458543/product-jpeg-125x125.jpg",
    category: "TABLETOP WEIGHING SYSTEMS",
    description: "Explore convenient tabletop weighing equipment designed for practical weighing applications and everyday use."
  },
  {
    name: "Bench Weighing",
    image: "https://5.imimg.com/data5/ANDROID/Default/2026/1/573079654/PR/FE/YF/3458543/product-jpeg-125x125.jpeg",
    category: "INDUSTRIAL WEIGHING",
    description: "Discover bench weighing solutions for measurement requirements across different commercial and industrial environments."
  },
  {
    name: "Heavy Duty Platform Scale",
    image: "https://5.imimg.com/data5/ANDROID/Default/2025/8/538986303/ND/WB/FN/3458543/product-jpeg-125x125.jpg",
    category: "HEAVY DUTY WEIGHING",
    description: "Explore heavy-duty platform weighing solutions designed for demanding industrial weighing applications."
  },
  {
    name: "Battery Tester",
    image: "https://5.imimg.com/data5/GLADMIN/Default/2021/11/MX/HL/PF/3458543/capacity-200kg-125x125.jpeg",
    category: "TESTING EQUIPMENT",
    description: "Explore specialized testing equipment for measurement and testing-related applications."
  }
];

const categoryButtons = document.querySelectorAll(".category-btn");
const showcase = document.getElementById("showcaseContent");

const productImage = document.getElementById("productImage");
const productName = document.getElementById("productName");
const productCategory = document.getElementById("productCategory");
const productDescription = document.getElementById("productDescription");
const imageCounter = document.getElementById("imageCounter");
const productNumber = document.getElementById("productNumber");

function showProduct(index) {
  const product = products[index];

  if (!product || !showcase || !productImage) return;

  categoryButtons.forEach(btn => btn.classList.remove("active"));
  categoryButtons[index]?.classList.add("active");

  showcase.classList.remove("changing");
  void showcase.offsetWidth;
  showcase.classList.add("changing");

  productImage.src = product.image;
  productImage.alt = product.name;

  if (productName) productName.textContent = product.name;
  if (productCategory) productCategory.textContent = product.category;
  if (productDescription) productDescription.textContent = product.description;

  if (imageCounter) {
    imageCounter.textContent =
      String(index + 1).padStart(2, "0") + " — 12";
  }

  if (productNumber) {
    productNumber.textContent =
      "REF. " + String(index + 1).padStart(3, "0");
  }

  const enquiryLink = document.getElementById("enquiryLink");
  if (enquiryLink) enquiryLink.href = "#contact";
}

categoryButtons.forEach(button => {
  button.addEventListener("click", () => {
    showProduct(Number(button.dataset.index));
  });
});

/* ==========================================
   PRODUCT GALLERY 2
========================================== */

(function () {
  const root = document.getElementById("product-gallery");
  if (!root) return;

  const galleryProducts = [
    {
      name: "Weighing Scale",
      category: "PRECISION WEIGHING SYSTEMS",
      image: "https://image.made-in-china.com/2f0j00dlyRGhACEfqu/Electronic-Balance-Electronic-Scale-Laboratory-Digital-Scale-6000g-0-5g-Precision-Balance.jpg",
      description: "Explore weighing equipment designed for different commercial and professional measurement applications."
    },
    {
      name: "Platform Scale",
      category: "INDUSTRIAL WEIGHING",
      image: "https://sc04.alicdn.com/kf/H73ed204bf2d943d58ef472f5c969b87co.jpg",
      description: "Discover platform weighing equipment for industrial and commercial weighing requirements."
    },
    {
      name: "Counting Scale",
      category: "DIGITAL COUNTING SYSTEMS",
      image: "https://www.kern-waagen.at/file/uploadcache/3zPlIScwYX/CLIPx1200x627/bild-eichbare-zaehlsystem-max-3-kg-6-kg-d0.00001-kg.jpg",
      description: "Explore counting systems designed for weighing and counting similar items in inventory and commercial operations."
    },
    {
      name: "Laboratory Scale",
      category: "LABORATORY EQUIPMENT",
      image: "https://www.labotronics.com/assets/products/LB-42AWH/17695108202.webp",
      description: "Precision laboratory weighing equipment for measurement-focused professional environments."
    },
    {
      name: "Electronic Scale",
      category: "ELECTRONIC WEIGHING",
      image: "https://www.labozon.com/assets/products/LZ-EB-B110/17694253161.webp",
      description: "Electronic weighing solutions featuring digital displays and convenient measurement controls."
    },
    {
      name: "Load Cell",
      category: "INDUSTRIAL COMPONENTS",
      image: "https://www.diniargeo.com/media/gopfzgc0/sbk.png?mode=max&rnd=133922435258230000&width=500",
      description: "Industrial load cell components used in weighing systems and measurement applications."
    },
    {
      name: "Bench Scale",
      category: "BENCH WEIGHING SYSTEMS",
      image: "https://www.pce-instruments.com/english/slot/2/artimg/large/pce-instruments-lab-scale-pce-pcs-6-5889691_1262025.webp",
      description: "Compact bench weighing equipment for commercial, workplace and professional applications."
    },
    {
      name: "Hanging Scale",
      category: "SPECIALISED WEIGHING",
      image: "https://www.equal.store/cdn/shop/files/OCS-D5T-01.jpg?v=1710765332",
      description: "Digital hanging weighing equipment for applications involving suspended loads."
    },
    {
      name: "Table Top Scale",
      category: "TABLETOP WEIGHING",
      image: "https://ussolid.com/cdn/shop/files/JFDBS00086-main.jpg?v=1733401217&width=1445",
      description: "Compact tabletop weighing equipment designed for convenient measurement in different workspaces."
    },
    {
      name: "Bench Weighing",
      category: "COMMERCIAL WEIGHING",
      image: "https://image.made-in-china.com/202f0j00MzeCwWKHribt/0-0001g-High-Precision-Electronic-Analytical-Balance-with-Good-Price-Jj124bc.webp",
      description: "Explore weighing equipment for practical commercial and professional measurement requirements."
    },
    {
      name: "Heavy Duty Platform Scale",
      category: "HEAVY DUTY WEIGHING",
      image: "https://inspectiontools.co.za/cdn/shop/files/1a8727ab-41a9-4735-8577-615a8c6cd4f5.jpg?v=1779058968",
      description: "Industrial platform weighing equipment for demanding weighing applications."
    },
    {
      name: "Battery Tester",
      category: "TESTING EQUIPMENT",
      image: "https://i5.walmartimages.com/seo/12V-24V-Car-Battery-Tester-LCD-Digital-Battery-Analyzer-Car-Charge-Diagnostic-Tool-for-Car-Truck-Motorcycle-Red_2be0ccbd-b2d7-4736-a417-2511c5dcb676.49ec417a9a950f237fe674c7f89637aa.jpeg",
      description: "Explore battery testing equipment for diagnostic and testing applications."
    }
  ];

  const list = root.querySelector("#pgList");
  const image = root.querySelector("#pgImage");
  const title = root.querySelector("#pgTitle");
  const category = root.querySelector("#pgCategory");
  const description = root.querySelector("#pgDescription");
  const counter = root.querySelector("#pgCounter");
  const reference = root.querySelector("#pgReference");
  const showcase = root.querySelector("#pgShowcase");

  if (!list || !image || !title || !category || !description || !showcase) {
    return;
  }

  galleryProducts.forEach((product, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pg-item";
    button.setAttribute("aria-pressed", "false");

    const left = document.createElement("span");
    left.className = "pg-item-left";

    const num = document.createElement("span");
    num.className = "pg-num";
    num.textContent = String(index + 1).padStart(2, "0");

    const label = document.createElement("span");
    label.className = "pg-name";
    label.textContent = product.name;

    const arrow = document.createElement("span");
    arrow.className = "pg-arrow";
    arrow.textContent = "↗";

    left.append(num, label);
    button.append(left, arrow);

    button.addEventListener("click", () => showGalleryProduct(index));
    list.appendChild(button);
  });

  function showGalleryProduct(index) {
    const product = galleryProducts[index];
    if (!product) return;

    const buttons = root.querySelectorAll(".pg-item");

    buttons.forEach((button, i) => {
      const active = i === index;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    showcase.classList.remove("changing");
    void showcase.offsetWidth;
    showcase.classList.add("changing");

    image.style.opacity = "0";

    const newImage = new Image();

    newImage.onload = () => {
      image.src = product.image;
      image.alt = product.name;
      image.style.opacity = "1";
    };

    newImage.onerror = () => {
      image.alt = product.name + " image unavailable";
      image.style.opacity = "1";
    };

    newImage.src = product.image;

    title.textContent = product.name;
    category.textContent = product.category;
    description.textContent = product.description;

    const formatted = String(index + 1).padStart(2, "0");

    if (counter) counter.textContent = formatted + " — 12";
    if (reference) {
      reference.textContent = "REF. " + String(index + 1).padStart(3, "0");
    }

    const enquiry = root.querySelector("#pgEnquiry");
    if (enquiry) enquiry.href = "#contact";
  }

  // Set the first product without triggering the entrance animation.
  const firstProduct = galleryProducts[0];

  image.src = firstProduct.image;
  image.alt = firstProduct.name;
  title.textContent = firstProduct.name;
  category.textContent = firstProduct.category;
  description.textContent = firstProduct.description;

  if (counter) counter.textContent = "01 — 12";
  if (reference) reference.textContent = "REF. 001";

  const firstButton = list.querySelector(".pg-item");
  firstButton?.classList.add("active");
  firstButton?.setAttribute("aria-pressed", "true");

  // Animate the gallery only when it enters the viewport.
  observeSection(
    root,
    () => {
      root.classList.add("gallery-in-view");
    },
    () => {
      root.classList.remove("gallery-in-view");
    }
  );
})();
