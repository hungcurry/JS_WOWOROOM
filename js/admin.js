console.clear();
window.onload = function() {
  /*** DOM 與預設變數 ***/
  // orderProducts
  const orderList = document.querySelector('.orderPage-table__tbody');
  const deleteAllOrderBtn = document.querySelector('.discardAllBtn');
  const chart = document.querySelector('.js-chart');
  const modal = document.querySelector('.modal');
  let orderData = [];
  let tokenObj = {
    headers: {
      'Authorization': token
    }
  };

  /*** 函式處理 ***/
  // 初始化
  function init(){
    getOrderList();
  };
  init();
  // ====================
  // 取得後台訂單列表
  function getOrderList(){
    axios.get(`${url}/api/livejs/v1/admin/${apiPath}/orders`, tokenObj)
    .then(res => {
      orderData = res.data.orders;
      if (orderData.length > 0) {
        renderOrder(orderData);
        c3Data(orderData);
        c3Data_lv2(orderData);
      }else{
        orderList.innerHTML ="";
        chart.innerHTML = `<p class="noInfo">目前尚未有訂單</p>`
      }
    })
    .catch(err =>{
      console.log(err);
    })
  }
  // renderOrder
  function renderOrder(data){
    // 時間排序
    data.sort(function(a, b){
      return b.createdAt - a.createdAt;
    })
    let str = "";
    data.forEach(function(item , idx){
      // 同筆商品字串
      let ary = item.products;
      let categoryStr = "";
      let orderStatus = item.paid ? "已處理" : "未處理";
      let statusClass = item.paid ? "processed" : "untreated";
      ary.forEach(function(str){
        categoryStr += `<p class="mt-1">${str.category}</p>`
      });
      // content
      str +=`
        <tr>
          <td>${item.id}</td>
          <td>
            <p>${item.user.name}</p>
            <p>${item.user.tel}</p>
          </td>
          <td>${item.user.address}</td>
          <td>${item.user.email}</td>
          <td>${categoryStr}</td>
          <td>
            <a 
            class="orderInfoMore text-primary js-check"
            data-info ="${idx}"
            >查看更多</a>
          </td>
          <td>${unixToDate(item.createdAt)}</td>
          <td class="orderStatus">
            <a href="javascript:;" class="${statusClass}" data-action="status" data-id=${item.id}>${orderStatus}</a>
          </td>
          <td>
            <input type="button" class="delSingleOrder-Btn" data-id=${item.id} value="刪除">
          </td>
        </tr>
      `
    });
    orderList.innerHTML = str;
    // 訂單品項
    const check = document.querySelectorAll('.js-check');
    check.forEach(function (item) {
        item.addEventListener('click', checkList);
    });
  };
  // 查看更多訂單狀態
  function checkList(e){
    let str = "";
    orderData.forEach(function(item , idx){
      let titleStr = "";
      item.products.forEach(function(str){
          titleStr += `
          <li class="d-flex">
            <span class="flex-basis-2">${str.title}</span>
            <span class="flex-basis-1 text-center">${str.quantity}</span>
            <span class="flex-basis-1 text-center">${toThousands(str.price)}</span>
          </li>
          `
      });
      str += `
      <div class="PopPage" id="${idx}">
        <div class="figure">
          <div class="PopPage_popup">
              <div class="PopPage__header">
                  <span class="flex-basis-2">品項</span>
                  <span class="flex-basis-1 text-center">數量</span>
                  <span class="flex-basis-1 text-center">金額</span>
              </div>
              <ul class="PopPage__body">
                  ${titleStr}
                  <li class="d-flex p-2 justify-end">
                    <span class="flex-basis-2 text-right">總金額:&nbsp</span>
                    <span class="flex-basis-1 text-primary text-center">$NT${toThousands(item.total)}</span>
                  </li>
              </ul>
              <div class="PopPage__footer"><a class="close">確認</a></div>
          </div>
        </div>
      </div>
      `
    });
    modal.innerHTML = str;
    // modal
    const PopPage = document.querySelectorAll('.PopPage');
    const close = document.querySelectorAll('.close');
    const idx = e.target.getAttribute('data-info');
    PopPage.forEach(function(item){
      if (idx === item.getAttribute("id")) {
        item.classList.add("active");
      }
    })
    close.forEach(function(item){
      item.addEventListener('click',remove);
    })
    function remove(){
      PopPage.forEach(function(item){
        item.classList.remove("active");
      })
    };
  };
  // 修改單筆訂單狀態
  function editOrderItem(e){
    let putId = e.target.getAttribute("data-id");
    let paidStatus = false;
    if(e.target.getAttribute('data-action') !== "status"){
      return;
    } 
    else if (e.target.textContent === "未處理")paidStatus = true;
    else paidStatus = false;
    let putObj ={
      "data": {
        "id": putId,
        "paid": paidStatus
      }
    }
    axios.put(`${url}/api/livejs/v1/admin/${apiPath}/orders/`, putObj , tokenObj)
    .then(function (res) {
      Swal.fire({
        title: `修改 訂單狀態 成功`,
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
        width: "400px"
      });
      getOrderList();
    })
    .catch(err =>{
      console.log(err);
    })
  };
  // ====================
  // 刪除單筆訂單
  function deleteOrderItem(e){
    let deleteId = e.target.getAttribute("data-id");
    if (e.target.getAttribute('class') !== "delSingleOrder-Btn") {
      return;
    }
    axios.delete(`${url}/api/livejs/v1/admin/${apiPath}/orders/${deleteId}`, tokenObj)
    .then(function (res) {
      Swal.fire({
        title: `刪除 單筆訂單 成功`,
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
        width: "400px"
      });
      getOrderList();
    })
    .catch(err =>{
      console.log(err);
    })
  };
  // 刪除全部訂單
  function deleteAllOrder(e) {
    if (orderData.length === 0) return;
    axios.delete(`${url}/api/livejs/v1/admin/${apiPath}/orders`, tokenObj)
    .then(function (res) {
      Swal.fire({
        title: `刪除 全部訂單 成功`,
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
        width: "400px"
      });
      getOrderList();
    })
    .catch(err =>{
      console.log(err);
    })
  }
  // ====================
  // c3資料處理
  function c3Data(data){
    // 全類別營收比重
    let categoryObj = {};
    data.forEach(function(item){
      item.products.forEach(function(product){
        if (categoryObj[product.category] === undefined) {
          categoryObj[product.category] = product.price * product.quantity;
        } else {
          categoryObj[product.category] += product.price * product.quantity;
        }
      });
    });
    let categoryKey = Object.keys(categoryObj);
    let categoryAry = categoryKey.map(function(item){
      return [ item , categoryObj[item] ];
    });

    document.querySelector(".categoryChart").textContent = "全類別營收比重";
    categoryChart(categoryAry);

  };
  // categoryChart
  function categoryChart(data){
    let chart = c3.generate({
      bindto: '#chart',
      data: {
        type: "pie",
        columns: data,
        colors:{
          "床架":"#DACBFF",
          "收納":"#9D7FEA",
          "窗簾":"#5434A7",
        },
      }
    });
  };
  function c3Data_lv2(data){
    // 全品項營收比重
    let projectObj = {};
    data.forEach(function(item){
      item.products.forEach(function(product){
        if (projectObj[product.title] === undefined) {
          projectObj[product.title] = product.price * product.quantity;
        } else {
          projectObj[product.title] += product.price * product.quantity;
        }
      });
    });
    projectKey = Object.keys(projectObj);
    let projectAry = projectKey.map(function(item){
      return [ item , projectObj[item] ];
    });
    // sort
    let projectArySort = projectAry.sort(function(a,b){
      let valueA = a[1];
      let valueB = b[1];
      return valueB - valueA;
    });
    // 重構資料-篩選出前三名營收品項
    let total = 0;
    if (projectArySort.length > 3) {
      projectArySort.filter(function(product,idx){
        if (idx > 2) total += product[1];
      });
      projectArySort.splice(3 , projectArySort.length);
      projectArySort.push(["其他" , total]);
    }
    document.querySelector(".projectChart").textContent = "全品項營收比重";
    projectChart(projectArySort);
  };
  // projectChart
  function projectChart(data){
    let chart2 = c3.generate({
      bindto: '#chart2',
      data: {
        type: "pie",
        columns: data
      },
      color: {
        pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFD"],
      }
    });
  };
  // ====================
  /*** 監聽事件***/
  orderList.addEventListener("click", deleteOrderItem);
  orderList.addEventListener("click", editOrderItem);
  deleteAllOrderBtn.addEventListener('click', deleteAllOrder);
};



