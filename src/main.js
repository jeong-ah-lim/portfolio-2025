import "../scss/style.scss";

document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector("#about");
  const btnMenu = document.querySelector(".btnMenu");
  const closeMenu = document.querySelector(".closeMenu");
  const fullMenu = document.querySelector(".fullMenu");

  // ==============================
  // 0. 풀메뉴 열기 / 닫기
  // ==============================
  const openMenu = () => {
    if (!fullMenu) return;
    fullMenu.classList.add("show");
    document.body.classList.add("menuOpen");
  };

  const hideMenu = () => {
    if (!fullMenu) return;
    fullMenu.classList.remove("show");
    document.body.classList.remove("menuOpen");
  };

  if (btnMenu && fullMenu) {
    btnMenu.addEventListener("click", openMenu);
  }

  if (closeMenu && fullMenu) {
    closeMenu.addEventListener("click", hideMenu);
  }

  // ==============================
  // 1. ABOUT 섹션 스크롤 스텝 애니메이션
  // ==============================
  if (section) {
    const lines = section.querySelectorAll(".introLine");
    const total = lines.length;
    let maxStep = 0;

    const onScrollAbout = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;

      const sectionHeight = rect.height || section.offsetHeight;
      const viewCenter = vh / 2;
      const distanceFromTop = viewCenter - rect.top;

      let progress = distanceFromTop / sectionHeight;
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;

      const step = Math.ceil(progress * total);

      if (step > maxStep) {
        for (let i = maxStep + 1; i <= step; i++) {
          section.classList.add(`step-${i}`);
        }
        maxStep = step;

        if (maxStep >= total) {
          window.removeEventListener("scroll", onScrollAbout);
        }
      }
    };

    window.addEventListener("scroll", onScrollAbout);
    onScrollAbout();
  }

  // ==============================
  // 2. 메뉴 클릭 시 해당 섹션으로 스무스 스크롤
  //    - #ABOUT, #SKILLSET 처럼 대문자 → id는 소문자이므로 JS에서 맞춰줌
  // ==============================
  const fullMenuLogo = document.querySelector(".fullMenu .logo");
  const navLinks = document.querySelectorAll('.navWrap a[href^="#"]');
  const header = document.querySelector("header");
  const headerHeight = header ? header.offsetHeight : 0;

  const handleNavClick = (event) => {
    event.preventDefault();

    const href = event.currentTarget.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    const rawId = href.slice(1); // "ABOUT"
    const targetId = rawId.toLowerCase(); // "about"
    const targetSection = document.getElementById(targetId);
    if (!targetSection) return;

    const targetTop =
      window.pageYOffset +
      targetSection.getBoundingClientRect().top -
      headerHeight;

    window.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });

    // 모바일 풀메뉴 닫기
    hideMenu();
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", handleNavClick);
  });

  if (fullMenuLogo) {
    fullMenuLogo.addEventListener("click", () => {
      const targetSection = document.getElementById("home");
      if (!targetSection) return;

      const targetTop =
        window.pageYOffset +
        targetSection.getBoundingClientRect().top -
        headerHeight;

      window.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });

      // 풀메뉴 닫기
      hideMenu();
    });
  }


  // ==============================
  // 3. Projects 섹션: 세로 스크롤 → 가로 슬라이드 (fixed로 고정)
  // ==============================
  const projectsSection = document.querySelector("#projects");
  const projectsInner = projectsSection?.querySelector(".porjectsInner");

  if (projectsSection && projectsInner) {
    let maxTranslateX = 0;

    // 가로로 얼마나 움직일 수 있는지 계산
    const calcMaxTranslateX = () => {
      const totalWidth = projectsInner.scrollWidth;   // li 전체 가로 길이
      const viewportWidth = window.innerWidth;
      maxTranslateX = Math.max(0, totalWidth - viewportWidth);
    };

    calcMaxTranslateX();

    const onScrollProjects = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const sectionTop = projectsSection.offsetTop;
      const sectionHeight = projectsSection.offsetHeight;
      const viewportHeight = window.innerHeight;

      // fixed로 붙어 있을 스크롤 구간
      const start = sectionTop;                          // Projects 섹션 시작
      const end = sectionTop + sectionHeight - viewportHeight; // 섹션 끝에서 한 화면 남긴 위치

      // 1) 섹션 위쪽: 아직 진입 전
      if (scrollY < start) {
        projectsInner.classList.remove("is-fixed", "is-bottom");
        projectsInner.style.transform = "translateX(0)";
        return;
      }

      // 2) 섹션을 완전히 지난 뒤
      if (scrollY > end) {
        projectsInner.classList.remove("is-fixed");
        projectsInner.classList.add("is-bottom");
        projectsInner.style.transform = `translateX(${-maxTranslateX}px)`;
        return;
      }

      // 3) 섹션 안에 있는 동안: 화면에 고정 + 가로로 슬라이드
      projectsInner.classList.add("is-fixed");
      projectsInner.classList.remove("is-bottom");

      const progress = (scrollY - start) / (end - start); // 0 ~ 1
      const translateX = -maxTranslateX * progress;
      projectsInner.style.transform = `translateX(${translateX}px)`;
    };

    window.addEventListener("resize", () => {
      calcMaxTranslateX();
      onScrollProjects();
    });

    window.addEventListener("scroll", onScrollProjects);
    onScrollProjects();
  }
});
