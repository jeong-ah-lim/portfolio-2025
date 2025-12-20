import "../scss/style.scss";

document.addEventListener("DOMContentLoaded", () => {
  // ==============================
  // 0) 풀메뉴 열기 / 닫기
  // ==============================
  const btnMenu = document.querySelector(".btnMenu");
  const closeMenu = document.querySelector(".closeMenu");
  const fullMenu = document.querySelector(".fullMenu");

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

  if (btnMenu) btnMenu.addEventListener("click", openMenu);
  if (closeMenu) closeMenu.addEventListener("click", hideMenu);

  // ==============================
  // 1) ABOUT 스텝 애니메이션 (IntersectionObserver로 개선)
  //    - .introLine이 화면에 들어오면 step-n 누적
  // ==============================
  const aboutSection = document.querySelector("#about");

  if (aboutSection) {
    const lines = [...aboutSection.querySelectorAll(".introLine")];
    let maxStep = 0;

    // 라인마다 step 번호 부여
    lines.forEach((line, idx) => {
      line.dataset.step = String(idx + 1);
    });

    const aboutIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const step = Number(entry.target.dataset.step || "0");
          if (step > maxStep) {
            for (let i = maxStep + 1; i <= step; i++) {
              aboutSection.classList.add(`step-${i}`);
            }
            maxStep = step;
          }

          // 한 번 실행하면 해당 라인은 관찰 해제
          aboutIO.unobserve(entry.target);
        });
      },
      {
        root: null,
        threshold: 0.5,
        rootMargin: "0px 0px -20% 0px",
      }
    );

    lines.forEach((line) => aboutIO.observe(line));
  }

  // ==============================
  // 2) 메뉴 클릭 시 해당 섹션으로 이동
  //    - #ABOUT 같은 대문자 링크 → id는 소문자라고 가정하고 toLowerCase()
  //    - CONTACT는 Projects 가로 슬라이드 구간을 "안 보이게" auto 점프
  // ==============================
  const fullMenuLogo = document.querySelector(".fullMenu .logo");
  const navLinks = document.querySelectorAll('.navWrap a[href^="#"]');
  const header = document.querySelector("header");

  const getHeaderHeight = () => (header ? header.offsetHeight : 0);

  const scrollToSection = (targetId, behavior = "smooth") => {
    const targetSection = document.getElementById(targetId);
    if (!targetSection) return;

    const headerHeight = getHeaderHeight();
    const baseTop = window.pageYOffset + targetSection.getBoundingClientRect().top;

    // 기본은 헤더에 안 가리게 위로 당김(-)
    // contact는 더 아래로 보내고 싶으면 (+)로
    const offset = targetId === "contact" ? headerHeight : -headerHeight;

    window.scrollTo({
      top: baseTop + offset,
      behavior,
    });
  };

  const handleNavClick = (event) => {
    event.preventDefault();

    const href = event.currentTarget.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    const rawId = href.slice(1); // "ABOUT" / "PROJECTS" / "CONTACT"
    const targetId = rawId.toLowerCase(); // "about" / "projects" / "contact"
    const isContact = targetId === "contact";

    scrollToSection(targetId, isContact ? "auto" : "smooth");
    hideMenu();
  };

  navLinks.forEach((link) => link.addEventListener("click", handleNavClick));

  if (fullMenuLogo) {
    fullMenuLogo.addEventListener("click", () => {
      scrollToSection("home", "smooth");
      hideMenu();
    });
  }

  // ==============================
  // 3) Projects: 세로 스크롤 → 가로 슬라이드
  //    - IntersectionObserver로 "근처에서만" scroll 핸들러 활성화
  //    - requestAnimationFrame으로 transform 업데이트 최적화
  // ==============================
  const projectsSection = document.querySelector("#projects");
  const projectsInner =
    projectsSection?.querySelector(".projectsInner")

  if (projectsSection && projectsInner) {
    let maxTranslateX = 0;
    let latestScrollY = 0;
    let ticking = false;
    let active = false;

    const calcMaxTranslateX = () => {
      const totalWidth = projectsInner.scrollWidth; // 내부 전체 가로 길이
      const viewportWidth = window.innerWidth;
      maxTranslateX = Math.max(0, totalWidth - viewportWidth);
    };

    const applyProjectsTransform = () => {
      ticking = false;

      const scrollY = latestScrollY;
      const sectionTop = projectsSection.offsetTop;
      const sectionHeight = projectsSection.offsetHeight;
      const viewportHeight = window.innerHeight;

      const start = sectionTop;
      const end = sectionTop + sectionHeight - viewportHeight;

      const speedFactor = 1.5; // 숫자 클수록 천천히
      const scrollRange = (end - start) * speedFactor;

      // 섹션 진입 전
      if (scrollY < start) {
        projectsInner.classList.remove("is-fixed", "is-bottom");
        projectsInner.style.transform = "translateX(0)";
        return;
      }

      // 섹션 지난 후
      if (scrollY > end) {
        projectsInner.classList.remove("is-fixed");
        projectsInner.classList.add("is-bottom");
        projectsInner.style.transform = `translateX(${-maxTranslateX}px)`;
        return;
      }

      // 섹션 내부
      projectsInner.classList.add("is-fixed");
      projectsInner.classList.remove("is-bottom");

      // progress 안정화 (0~1)
      let progress = (scrollY - start) / scrollRange;
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;

      const translateX = -maxTranslateX * progress;
      projectsInner.style.transform = `translateX(${translateX}px)`;
    };

    const requestTick = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(applyProjectsTransform);
      }
    };

    const onScrollProjects = () => {
      latestScrollY = window.pageYOffset || document.documentElement.scrollTop;
      requestTick();
    };

    const onResizeProjects = () => {
      calcMaxTranslateX();
      onScrollProjects();
    };

    // 최초 계산
    calcMaxTranslateX();

    // Projects 섹션 근처에서만 활성화
    const projectsIO = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !active) {
          active = true;
          window.addEventListener("scroll", onScrollProjects, { passive: true });
          window.addEventListener("resize", onResizeProjects);
          onScrollProjects(); // 즉시 반영
        }

        if (!entry.isIntersecting && active) {
          active = false;
          window.removeEventListener("scroll", onScrollProjects);
          window.removeEventListener("resize", onResizeProjects);
        }
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "200px 0px 200px 0px", // 근처 오면 미리 켜기
      }
    );

    projectsIO.observe(projectsSection);
  }
});
