

  function unixToDate(unixTimestamp){
    let date = new Date(unixTimestamp*1000);
    return date.getFullYear() + "/" + (date.getMonth()+1 + "/" + date.getDate());
  };


  function formatPrice(num) {
    return num.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  }


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



