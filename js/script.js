console.clear();
window.onload = function(){
  /*** DOM 與預設變數 ***/
  const apiPath = 'ooopp42';
  const url = 'https://hexschoollivejs.herokuapp.com';
  // products
  const productWrap = document.querySelector('.productWrap');
  const productSelect = document.querySelector('.productSelect');
  // carts
  const shoppingCart = document.querySelector('.shoppingCart-table');
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
  function init(){
    getProductList();
    getCarList();
  };
  init();
  function formatPrice(num) {
    return num.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  }
  // ====================
  // 顯示前台產品清單
  function getProductList(){
    axios.get(`${url}/api/livejs/v1/customer/${apiPath}/products`)
    .then(res =>{
      productData = res.data.products;
      renderList(productData);
    })
    .catch(err =>{
      console.log(err);
    })
  };
  // renderList
  function renderList(data){
    let str = "";
    data.forEach(function(item){
      str +=`
      <li class="productCard">
        <h4 class="productType">新品</h4>
        <img src="${item.images}" alt="${item.title}">
        <a href="javascript:;" data-id="${item.id}" id="addCardBtn">加入購物車</a>
        <h3 title="${item.description}">${item.title}</h3>
        <del class="originPrice">NT$${formatPrice(item.origin_price.toString())}</del>
        <p class="nowPrice">NT$${formatPrice(item.price.toString())}</p>
      </li>
      `
    });
    productWrap.innerHTML = str;
  };
  // 篩選前台產品
  function filterProductList(e){
    let vm = e.target.value;
    if (vm !== "全部") {
      let newAry = productData.filter(item =>{
        return vm === item.category;
      });
      renderList(newAry);
    } else {
      renderList(productData);
    }
  };
  // ====================
  // 顯示前台購物車清單
  function getCarList(){
    axios.get(`${url}/api/livejs/v1/customer/${apiPath}/carts`)
    .then(res =>{
      cartData = res.data;
      renderCarts(cartData);
    })
    .catch(err =>{
      console.log(err);
    })
  };
  // renderCarts
  function renderCarts(data){
    let str = "";
    data.carts.forEach(function(item){
      str +=`
      <tr>
        <td>
          <div class="cardItem-title">
            <img src="${item.product.images}" alt="${item.product.title}">
            <p>${item.product.title}</p>
          </div>
        </td>
        <td>NT$${formatPrice(item.product.price.toString())}</td>
        <td>${item.quantity}</td>
        <td>NT$${formatPrice((item.product.price * item.quantity).toString())}</td>
        <td class="discardBtn">
          <a href="javascript:;" class="material-icons" data-id="${item.id}">
            clear
          </a>
        </td>
    </tr>
      `
    });
    tbody.innerHTML = str;
    cartTotal.textContent = `NT$${formatPrice(cartData.finalTotal.toString())}`
  };
  // 加入購物車
  function addCart(e){
    if (e.target.nodeName !== "A") {
      return;
    }
    let id = e.target.getAttribute("data-id");
    let numCheck = 1;
    //累加商品數量呈現
    cartData.carts.forEach(function(item){
      if (id === item.product.id) {
        numCheck = item.quantity += 1;
      }
    });
    let postObj = {
      "data": {
        "productId":id,
        "quantity": numCheck
      }
    }
    axios.post(`${url}/api/livejs/v1/customer/${apiPath}/carts` , postObj)
    .then(res =>{
      getCarList();
      alert(`加入 購物車 成功`);
    })
    .catch(err =>{
      console.log(err);
    })
  };
  // ====================
  // 刪除單筆購物車
  function deleteCartItem(e){
    let deleteId =  e.target.getAttribute("data-id");
    if (e.target.getAttribute("class") !== "material-icons") {
      return;
    }
    axios.delete(`${url}/api/livejs/v1/customer/${apiPath}/carts/${deleteId}`)
    .then(res =>{
      alert("刪除 單筆購物車 成功！");
      getCarList();
    })
    .catch(err =>{
      console.log(err);
    })
  };
  // 刪除所有購物車
  function deleteCartAll(){
    if (cartData.carts.length === 0) {
      alert("購物車 無商品 ");
      return;
    }
    if (cartData.carts.length >= 1) {
      inputs.forEach(function(item){
        item.nextElementSibling.textContent = '';
      });
    }
    axios.delete(`${url}/api/livejs/v1/customer/${apiPath}/carts`)
    .then(res =>{
      alert("刪除 全部購物車 成功！");
      getCarList();
    })
    .catch(err =>{
      console.log(err);
    })
  };
  // ====================
  // 送出購買訂單
  function orderCheck(e){
    e.preventDefault();
    if (cartData.carts.length === 0) {
      alert("請加入 至少一個 購物車品項！");
      return;
    }
    if (
      orderName.value ==="" &&
      orderTel.value ==="" &&
      orderEmail.value ==="" &&
      orderAddress.value ==="" &&
      orderPayment.value ===""
    ) {
      alert("請輸入 完整資料");
    }
    // 驗證
    let errors = validate(form, constraints);
    inputs.forEach(function(item){
      item.nextElementSibling.textContent = '';
      if(errors){
        let newAry = Object.keys(errors);
        newAry.forEach(keys => {
          if(item.nextElementSibling.getAttribute("data-message") === keys){
            item.nextElementSibling.textContent =  errors[keys][0].split(' ')[1];
          }
        })
      }
    });
    // addData
    if(!errors){
      let user ={
        name: orderName.value.trim(),
        tel: orderTel.value.trim(),
        email: orderEmail.value.trim(),
        address: orderAddress.value.trim(),
        payment: orderPayment.value.trim()
      }
      createOrder(user);
    }
  };
  function createOrder(user){
    let orderObj ={
      "data": {
        user
      }
    }
    axios.post(`${url}/api/livejs/v1/customer/${apiPath}/orders` , orderObj)
    .then(res =>{
      alert("訂單建立 成功!");
      getCarList();
      form.reset();
    })
    .catch(err =>{
      console.log(err);
    })
  };
  // ====================
  /*** 監聽事件***/
  productWrap.addEventListener("click", addCart);
  productSelect.addEventListener("change", filterProductList);
  shoppingCart.addEventListener("click", deleteCartItem);
  deleteAllCartBtn.addEventListener("click", deleteCartAll);
  sendOrder.addEventListener("click", orderCheck);
  
};



