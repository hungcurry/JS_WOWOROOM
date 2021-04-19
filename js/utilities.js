
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
