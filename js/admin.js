console.clear();
window.onload = function() {
  /*** DOM 與預設變數 ***/
  const apiPath = 'ooopp42';
  const url = 'https://hexschoollivejs.herokuapp.com';
  const token = 'ARKZV2RDkgPePxwyRbN09mcoR1s2';
  // orderProducts
  const orderList = document.querySelector('.orderPage-table__tbody');
  const deleteAllOrderBtn = document.querySelector('.discardAllBtn');
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
      renderOrder(orderData);
      c3Data(orderData);
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
      ary.forEach(function(str){
        titleStr += `<p>${str.title}</p>`
      });
      ary.forEach(function(str){
        categoryStr += `<p>${str.category}</p>`
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
            <a href="javascript:;" class="state" data-id=${item.id}>${item.paid ?'已處理':'未處理' }</a>
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
    if (e.target.getAttribute('class') !== "state") {
      return;
    } else if (e.target.textContent === "已處理"){
      return;
    }
    let putObj ={
      "data": {
        "id": putId,
        "paid": true
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
    let ary = orderData.map(function(item){
      return item.products;
    });
    let productsAry = [];
    ary.forEach(function(item){
      if(item.length >= 1) productsAry.push(...item);
    });
    let obj = {}; // {收納: 2, 床架: 2, 窗簾: 1}
    productsAry.forEach(function(item){
      if(obj[item.category] === undefined){
        obj[item.category] = 1;
      }else{
        obj[item.category] += 1;
      }
    });
    let objKeyAry = Object.keys(obj);  // ["收納", "床架", "窗簾"]

    let c3Data = objKeyAry.map(function(item){
      return [item , obj[item]];
    });
    [ c3Data[0],c3Data[1],c3Data[2]] = [ c3Data[1],c3Data[0],c3Data[2]] ;
    // console.log(c3Data);
    c3render(c3Data);
  };
  // c3render
  function c3render(data){
    let chart = c3.generate({
      bindto: '#chart',
      data: {
          type: "pie",
          columns: data,
          colors:{
            "床架":"#DACBFF",
            "收納":"#9D7FEA",
            "窗簾":"#5434A7",
          }
      },
    });
  };
  // ====================
  /*** 監聽事件***/
  orderList.addEventListener("click", deleteOrderItem);
  orderList.addEventListener("click", editOrderItem);
  deleteAllOrderBtn.addEventListener('click', deleteAllOrder);
};



