console.clear();
window.onload = function() {
  /*** DOM 與預設變數 ***/
  const apiPath = 'ooopp42';
  const url = 'https://hexschoollivejs.herokuapp.com';
  const token = 'ARKZV2RDkgPePxwyRbN09mcoR1s2';
  // orderProducts
  const orderList = document.querySelector('.orderPage-table__tbody');
  const deleteAllOrderBtn = document.querySelector('.discardAllBtn');
  const chart = document.querySelector('.js-chart');
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
  function unixToDate(unixTimestamp){
    let date = new Date(unixTimestamp*1000);
    return date.getFullYear() + "/" + (date.getMonth()+1 + "/" + date.getDate());
  };
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
    let str = "";
    data.forEach(function(item , idx){
      // 同筆商品字串
      let ary = item.products;
      let titleStr = "";
      let categoryStr = "";
      let orderStatus = item.paid ? "已處理" : "未處理";
      let statusClass = item.paid ? "processed" : "untreated";
      ary.forEach(function(str){
        titleStr += `<p class="mt-1">${str.title}</p>`
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
            <p>${titleStr}</p>
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
      alert("修改 狀態成功")
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
      alert("刪除 單筆訂單 成功")
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
      alert("刪除 全部訂單 成功")
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



