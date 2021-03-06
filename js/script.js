console.clear();
window.onload = function () {
  /*** DOM 與預設變數 ***/
  // Loading
  const textWrapper = document.querySelector('.js-loading-letters');
  const loading = document.querySelector(".js-loading");
  // products
  const productWrap = document.querySelector('.productWrap');
  const productSelect = document.querySelector('.productSelect');
  // carts
  const shoppingCart = document.querySelector('.shoppingCart-table');
  const thead = document.querySelector('.thead');
  const tbody = document.querySelector('.tbody');
  const cartTotal = document.querySelector('.cartTotal');
  const deleteAllCartBtn = document.querySelector('.discardAllBtn');
  // input
  const orderName = document.querySelector('.orderName');
  const orderTel = document.querySelector('.orderTel');
  const orderEmail = document.querySelector('.orderEmail');
  const orderAddress = document.querySelector('.orderAddress');
  const orderPayment = document.querySelector('.orderPayment');
  const form = document.querySelector('.orderInfo-form');
  const sendOrder = document.querySelector('.orderInfo-btn');
  const inputs = document.querySelectorAll("input[type=text],input[type=tel],input[type=email],select[name=交易方式]");
  const constraints = {
    // 需與 input 的 name 屬性對應
    "姓名": {
      presence: {
        message: "請輸入姓名"
      },
      length: {
        minimum: 2,
        tooShort: "請勿輸入一個字"
      }
    },
    '電話': {
      presence: {
        message: "請輸入電話"
      },
      length: {
        minimum: 10,
        tooShort: "請輸入正確的電話號碼"
      },
      format: {
        // pattern: /^[09]{2}\d{8}$/,
        pattern: "[0-9]+",
        message: "請輸入正確的號碼"
      }
    },
    'Email': {
      presence: {
        message: "請輸入電子信箱"
      },
      email: {
        message: "請輸入正確的電子信箱"
      }
    },
    '寄送地址': {
      presence: {
        message: "請輸入寄送地址"
      },
      length: {
        minimum: 10,
        tooShort: "請輸入正確地址"
      }
    },
    '交易方式': {
      presence: {
        message: "請選擇交易方式"
      }
    }
  };
  let productData = [];
  let cartData = [];

  /*** 函式處理 ***/
  // 初始化
  function init() {
    runLoading();
    getProductList();
    getCarList();
  };
  init();
  // ====================
  // Loading
  function runLoading() {
    segmentationStr = textWrapper.textContent.replace(/\S/g, "<span class='loading-letter d-inline-block'>$&</span>");
    textWrapper.innerHTML = segmentationStr;
    /* Anime */
    let animation = anime.timeline({
          loop: true
        })
        .add({
            targets: '.loading-line',
            scaleX: [0, 1],
            opacity: [0.5, 1],
            easing: "easeInOutExpo",
            duration: 900
        })
        .add({
            targets: '.loading-letter',
            opacity: [0, 1],
            translateX: [40, 0],
            translateZ: 0,
            scaleX: [0.3, 1],
            easing: "easeOutExpo",
            duration: 800,
            offset: '-=1000',
            delay: (el, i) => 150 + 25 * i
        })
        .add({
            targets: '.block',
            opacity: 0,
            duration: 1000,
            easing: "easeOutExpo",
            delay: 1000
        });
      setTimeout(function () {
          // loading 消失
          loading.classList.add('loading-fadeOut');
          animation.pause();
          // aso
          AOS.init({
            offset: 120, 
            delay: 500, 
            duration: 1000, 
            easing: 'ease',
            once: false, 
            mirror: false, 
            anchorPlacement: 'top-bottom',
          });
      }, 2400);
  };
  // ====================
  // 顯示前台產品清單
  function getProductList() {
    axios.get(`${url}/api/livejs/v1/customer/${apiPath}/products`)
      .then(res => {
        productData = res.data.products;
        renderList(productData);
        getCategories();
      })
      .catch(err => {
        console.log(err);
      })
  };
  // renderList
  function renderList(data) {
    // 價格排序
    data.sort(function(a, b){
      return a.price - b.price ;
    })
    let str = "";
    data.forEach(function (item) {
      str += `
      <li class="productCard">
        <h4 class="productType">新品</h4>
        <img src="${item.images}" alt="${item.title}">
        <a href="javascript:;" data-id="${item.id}" data-action="addCard" id="addCardBtn">加入購物車</a>
        <h3 title="${item.description}">${item.title}</h3>
        <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
        <p class="nowPrice">NT$${toThousands(item.price)}</p>
      </li>
      `
    });
    productWrap.innerHTML = str;
  };
  // 顯示前台select
  function getCategories(){
    let ary = productData.map((item)=>{
      return item.category
    })
    aryCategories = ary.filter((category , idx)=>{
      return ary.indexOf(category) === idx;
    })
    // console.log(aryCategories); ["收納", "窗簾", "床架"]
    let str = '<option value="全部" selected>全部</option>';
    aryCategories.forEach((item)=>{
      str+= `
      <option value="${item}">${item}</option>
      `
    })
    productSelect.innerHTML = str;
  };
  // 篩選前台產品
  function filterProductList(e) {
    let vm = e.target.value;
    if (vm !== "全部") {
      let newAry = productData.filter(item => {
        return vm === item.category;
      });
      renderList(newAry);
    } else {
      renderList(productData);
    }
  };
  // ====================
  // 顯示前台購物車清單
  function getCarList() {
    axios.get(`${url}/api/livejs/v1/customer/${apiPath}/carts`)
      .then(res => {
        cartData = res.data;
        renderCarts(cartData);
      })
      .catch(err => {
        console.log(err);
      })
  };
  // renderCarts
  function renderCarts(data) {
    if (cartData.carts.length > 0) {
      // 價格排序
      data.carts.sort(function(a, b){
        return a.product.price - b.product.price ;
      })
      let theadStr = "";
      let str = "";
        theadStr= `
        <tr>
          <th width="35%">品項</th>
          <th width="15%">單價</th>
          <th width="15%">數量</th>
          <th width="15%">金額</th>
          <th width="20%"></th>
        </tr>
      `
      data.carts.forEach(function (item) {
        str += `
        <tr>
          <td>
            <div class="cardItem-title">
              <img src="${item.product.images}" alt="${item.product.title}">
              <p>${item.product.title}</p>
            </div>
          </td>
          <td>NT$${toThousands(item.product.price)}</td>
          <td>
            <span class="material-icons minus" data-action="minus" data-id="${item.id}">remove</span>
            <input type="text" value="${item.quantity}" class="cardItem__quantity" readonly="readonly">
            <span class="material-icons add" data-action="add" data-id="${item.id}">add</span>
          </td>
          <td>NT$${toThousands(item.product.price * item.quantity)}</td>
          <td class="discardBtn">
            <a href="javascript:;" 
            class="material-icons delete" 
            data-action="delete" 
            data-id="${item.id}"
            data-title="${item.product.title}">
              clear
            </a>
          </td>
      </tr>
        `
      });
      thead.innerHTML = theadStr;
      tbody.innerHTML = str;
      cartTotal.textContent = `NT$${toThousands(cartData.finalTotal)}`;
    } else {
      cartTotal.textContent = `NT$ 0`;
      thead.innerHTML = "";
      tbody.innerHTML = `<tr><td colspan ="5"><p class="noInfo">目前尚未有商品</p></td></tr>`;
    }
  };
  // 加入購物車
  function addCart(e) {
    e.preventDefault();
    if (e.target.getAttribute("data-action") !== "addCard") {
      return;
    }
    let id = e.target.getAttribute("data-id");
    let numCheck = 1;
    // 判斷重複購物商品
    if (cartData.carts.length >= 1) {
      let idKey = [];
      cartData.carts.forEach(function (item) {
        idKey.push(item.product.id);
      });
      if (idKey.indexOf(id) >= 0) {
        Swal.fire({
          title: `產品 已經在購物車內`,
          icon: "info",
          showConfirmButton: false,
          timer: 2000,
          width: "400px"
        });
        return;
      }
    } 
    let postObj = {
      data: {
        productId: id,
        quantity: numCheck
      }
    }
    axios.post(`${url}/api/livejs/v1/customer/${apiPath}/carts` , postObj)
    .then(res =>{
      console.log(res.data.carts);
      Swal.fire({
        title: `加入 購物車 成功`,
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
        width: "400px"
      });
      cartData = res.data;
      renderCarts(cartData);
    })
    .catch(err =>{
      console.log(err);
    })
  };
  // 購物車數量更新
  function patchCartItem(e){
    let patchId = e.target.getAttribute("data-id");
    let numPatch = 0;
    if (
      e.target.dataset.action !== "minus" && 
      e.target.dataset.action !== "add") {
      return;
    }
    // 撈取遠端數量回來
    cartData.carts.forEach(function(item){
      if (patchId === item.id) numPatch = item.quantity
    });
    if (e.target.dataset.action === "minus") {
      numPatch -= 1;
      if (numPatch < 1) {
        numPatch = 1 ;
        Swal.fire({
          title: `數量不得為0`,
          icon: "info",
          showConfirmButton: false,
          timer: 2000,
          width: "400px"
        });
        return;
      }
    }
    if (e.target.dataset.action === "add") {
      numPatch += 1;
    }
    let patchObj = {
      data: {
        id: patchId,
        quantity: numPatch
      }
    }
    axios.patch(`${url}/api/livejs/v1/customer/${apiPath}/carts` , patchObj)
    .then(res =>{
      console.log(res);
      cartData = res.data;
      renderCarts(cartData);
    })
    .catch(err =>{
      console.log(err);
    })
  };
  // ====================
  // 刪除單筆購物車
  function deleteCartItem(e) {
    let deleteId = e.target.getAttribute("data-id");
    let title = e.target.getAttribute("data-title");
    if (e.target.dataset.action !== "delete") {
      return;
    }
    axios.delete(`${url}/api/livejs/v1/customer/${apiPath}/carts/${deleteId}`)
      .then(res => {
        Swal.fire({
          title: `刪除 ${title} 成功！`,
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          width: "500px"
        });
        cartData = res.data;
        renderCarts(cartData);
      })
      .catch(err => {
        console.log(err);
      })
  };
  // 刪除所有購物車
  function deleteCartAll() {
    if (cartData.carts.length === 0) {
      Swal.fire({
        title: `購物車 無商品`,
        icon: "info",
        showConfirmButton: false,
        timer: 2000,
        width: "400px"
      });
      return;
    }
    if (cartData.carts.length >= 1) {
      inputs.forEach(function (item) {
        item.nextElementSibling.textContent = '';
      });
    }
    axios.delete(`${url}/api/livejs/v1/customer/${apiPath}/carts`)
      .then(res => {
        Swal.fire({
          title: `刪除 全部購物車 成功！`,
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          width: "400px"
        });
        cartData = res.data;
        renderCarts(cartData);
      })
      .catch(err => {
        console.log(err);
      })
  };
  // ====================
  // 送出購買訂單
  function orderCheck(e) {
    e.preventDefault();
    if (cartData.carts.length === 0) {
      Swal.fire({
        title: `請加入 至少一個 購物車品項！`,
        icon: "info",
        showConfirmButton: false,
        timer: 2000,
        width: "450px"
      });
      return;
    }
    if (
      orderName.value === "" &&
      orderTel.value === "" &&
      orderEmail.value === "" &&
      orderAddress.value === "" &&
      orderPayment.value === ""
    ) {
      Swal.fire({
        title: `請輸入 完整資料`,
        icon: "info",
        showConfirmButton: false,
        timer: 2000,
        width: "400px"
      });
    }
    // 驗證
    let errors = validate(form, constraints);
    inputs.forEach(function (item) {
      item.nextElementSibling.textContent = '';
      if (errors) {
        let newAry = Object.keys(errors);
        newAry.forEach(keys => {
          if (item.nextElementSibling.getAttribute("data-message") === keys) {
            item.nextElementSibling.textContent = errors[keys][0].split(' ')[1];
          }
        })
      }
    });
    // addData
    if (!errors) {
      let user = {
        name: orderName.value.trim(),
        tel: orderTel.value.trim(),
        email: orderEmail.value.trim(),
        address: orderAddress.value.trim(),
        payment: orderPayment.value.trim()
      }
      createOrder(user);
    }
  };
  function createOrder(user) {
    let orderObj = {
      "data": {
        user
      }
    }
    axios.post(`${url}/api/livejs/v1/customer/${apiPath}/orders`, orderObj)
      .then(res => {
        Swal.fire({
          title: `訂單建立 成功!`,
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          width: "400px"
        });
        getCarList();
        form.reset();
      })
      .catch(err => {
        console.log(err);
      })
  };
  // ====================
  /*** 監聽事件***/
  productWrap.addEventListener("click", addCart);
  productSelect.addEventListener("change", filterProductList);
  shoppingCart.addEventListener("click", deleteCartItem);
  shoppingCart.addEventListener("click", patchCartItem);
  deleteAllCartBtn.addEventListener("click", deleteCartAll);
  sendOrder.addEventListener("click", orderCheck);
};
