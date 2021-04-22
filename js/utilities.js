
  // menu 切換
  const menuOpenBtn = document.querySelector('.menuToggle');
  const linkBtn = document.querySelectorAll('.topBar-menu a');
  let menu = document.querySelector('.topBar-menu');
  menuOpenBtn.addEventListener('click', menuToggle);
  linkBtn.forEach((item) => {
    item.addEventListener('click', closeMenu);
  })
  function menuToggle() {
    if (menu.classList.contains('openMenu')) {
      menu.classList.remove('openMenu');
    } else {
      menu.classList.add('openMenu');
    }
  }
  function closeMenu() {
    menu.classList.remove('openMenu');
  }

  // ScrollTo
  function ScrollTo(name) {
    ScrollToResolver(document.getElementById(name));
  }
  function ScrollToResolver(elem) {
    let jump = parseInt(elem.getBoundingClientRect().top * .2);
    document.body.scrollTop += jump;
    document.documentElement.scrollTop += jump;
    if (!elem.lastjump || elem.lastjump > Math.abs(jump)) {
      elem.lastjump = Math.abs(jump);
      setTimeout(function() {
        ScrollToResolver(elem);
      }, "30");
    } else {
      elem.lastjump = null;
    }
  }

  // swiper
  let swiper = new Swiper('.swiper-container', {
    autoplay: {
      delay: 3000,//輪播時間:3秒
      disableOnInteraction: false,
    },
    loop: true,
    loopedSlides: 2,
    initialSlide: 0, // 第０張先跑
    centeredSlides: true,
    slidesPerView: '1',
    spaceBetween: "-50%",
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.button-next',
      prevEl: '.button-prev',
    },
    effect: 'coverflow',
    coverflowEffect: {
      slideShadows: false, // slide 陰影
      rotate: 0,
      stretch: 0,
      depth: 100,
      modifier: 4,
    },
  });

  // util js、元件
  function toThousands(x) {
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

  function unixToDate(unixTimestamp){
    let date = new Date(unixTimestamp*1000);
    return date.getFullYear() + "/" + (date.getMonth()+1 + "/" + date.getDate());
  };





