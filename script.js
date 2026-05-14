/* =========================
   Tres Leches Billing – script.js
   Cart persists across category switches; Add Item modal has category pills & persistence;
   Stock logic: On Start increases only on stock-in, Current changes with stock-in/sales
   ========================= */

/* ---------- Catalog ---------- */
const CATALOG = {
  "Tresleches": [
    { id: "Strawberry",          label: "Strawberry",          price: 120, img: "images/strawberry.jpeg" },
    { id: "Rosemilk",            label: "Rosemilk",            price: 120, img: "images/rosemilk.jpeg" },
    { id: "Rasamalai",           label: "Rasamalai",           price: 120, img: "images/rasmalai.jpeg" },
    { id: "Moca Cafe",           label: "Moca Cafe",           price: 120, img: "images/moca.jpeg" },
    { id: "Lotus Biscoff",       label: "Lotus Biscoff",       price: 120, img: "images/biscoff.jpeg" },
    { id: "Snickers",            label: "Snickers",            price: 120, img: "images/snickers.png" },
    { id: "Butterscotch",        label: "Butterscotch",        price: 120, img: "images/butterscotch.png" },
    { id: "Boost",               label: "Boost",               price: 120, img: "images/boost.png" }
  ],
  "Matilda Cake": [
    { id: "Matilda - Chocolate", label: "Chocolate",           price: 150, img: "images/matildacake.jpeg" },
    { id: "Matilda - Pistachio", label: "Pistachio",           price: 200, img: "images/matildapistachio.png" }
  ],
  "Brownie": [
    { id: "Brownie - Chocolate", label: "Chocolate",           price: 120, img: "images/chocolatebrownie.png" },
    { id: "Brownie - Pistachio", label: "Pistachio",           price: 150, img: "images/browinepistachio.png" },
    { id: "Brownie - Classic",   label: "Classic",             price: 80,  img: "images/browineclassic.png" }
  ],
  "Hot Beverages": [
    { id: "Hot Chocolate - Chocolate", label: "Chocolate",     price: 80,  img: "images/hotchocolate.png" },
    { id: "Hot Pistachio - Pistachio", label: "Pistachio",     price: 100, img: "images/hotpistachio.png" }
  ],
  "Dubai Kunafa Chocolate": [
    { id: "DKC - Pistachio",     label: "Pistachio",           price: 200, img: "images/dubaipistachio.png" },
    { id: "DKC - Nutella",       label: "Nutella",             price: 200, img: "images/dubainutella.png" }
  ],
  "Salankatia": [
    { id: "Salankatia - Nutella",            label: "Nutella",            price: 200, img: "images/salankatianutella.png" },
    { id: "Salankatia - Biscoff",            label: "Biscoff",            price: 200, img: "images/salankatiabiscoff.png" },
    { id: "Salankatia - Pistachio",          label: "Pistachio",          price: 200, img: "images/salankatiapistachio.png" },
    { id: "Salankatia - Nutella Biscoff",    label: "Nutella Biscoff",    price: 200, img: "images/salankatianutellabiscoff.png" },
    { id: "Salankatia - Biscoff Pistachio",  label: "Biscoff Pistachio",  price: 200, img: "images/salankatiabiscoffpistachio.png" },
    { id: "Salankatia - Pistachio Nutella",  label: "Pistachio Nutella",  price: 200, img: "images/salankatiapistachionutella.png" }
  ]
};

const TAKEAWAY_CHARGE = 5;

/* ---------- Keys ---------- */
const STOCK_KEY = "cakeStock";
const SALES_KEY = "sales";
const STOCK_IN_KEY = "stockInLog";
const STOCK_OUT_KEY = "stockOutLog";
const DINE_QUEUE_KEY = "dineInQueue";
const ACTIVE_KEY = "activeFlavors";

/* ---------- DOM ---------- */
const cakeGrid       = document.getElementById("cakeGrid");
const totalCakesInput= document.getElementById("totalCakes");
const amountSummary  = document.getElementById("amountSummary");
const categoryTabsEl = document.getElementById("categoryTabs");

let orderId = parseInt(localStorage.getItem("nextOrderId") || "1", 10);
document.getElementById("currentOrderId").textContent = orderId;

let customerType = "Customer";
const customerTypeSelect = document.getElementById("customerTypeSelect");
customerTypeSelect.addEventListener("change", () => (customerType = customerTypeSelect.value));

/* Payment (top) */
const paymentModeEl   = document.getElementById("paymentMode");
const saveBtn         = document.getElementById("saveBtn");
const cashUpiDetails  = document.getElementById("cashUpiDetails");
const cashAmountInput = document.getElementById("cashAmount");
const upiAmountInput  = document.getElementById("upiAmount");

/* Dine-in list + search */
const dineList        = document.getElementById("dineList");
const scrollDineInBtn = document.getElementById("scrollDineInBtn");
const dineSearchInput = document.getElementById("dineSearch");
const clearDineSearch = document.getElementById("clearDineSearch");

/* Completed orders modal */
const completedPanel  = document.getElementById("completedPanel");
const completedList   = document.getElementById("completedList");
document.getElementById("viewCompletedBtn").addEventListener("click", openCompletedPanel);
document.getElementById("closeCompletedBtn").addEventListener("click", () => completedPanel.classList.add("hidden"));

/* Add Item modal */
const addItemModal = document.getElementById("addItemModal");
const addType      = document.getElementById("addType");
const addSearch    = document.getElementById("addSearch");
const addCardsGrid = document.getElementById("addCardsGrid");
const closeAddItemBtn = document.getElementById("closeAddItemBtn");
const confirmAddSelectedBtn = document.getElementById("confirmAddSelectedBtn");
const addCategoryTabsEl = document.getElementById("addCategoryTabs");
let addItemTargetOrderId = null;

/* Stock + manage */
const stockBtn   = document.getElementById("stockBtn");
const stockPanel = document.getElementById("stockPanel");
const closeStockBtn = document.getElementById("closeStockBtn");
const stockListEl = document.getElementById("stockList");
const saveStockBtn = document.getElementById("saveStockBtn");
const resetStockBtn= document.getElementById("resetStockBtn");
const stockTotalEl = document.getElementById("stockTotal");
const stockCategoryTabsEl = document.getElementById("stockCategoryTabs");

const manageItemsBtn = document.getElementById("manageItemsBtn");
const manageItemsModal = document.getElementById("manageItemsModal");
const manageItemsGrid  = document.getElementById("manageItemsGrid");
const manageCategoryTabsEl = document.getElementById("manageCategoryTabs");
const closeManageItemsBtn = document.getElementById("closeManageItemsBtn");
const saveManageItemsBtn  = document.getElementById("saveManageItemsBtn");

/* --- carts to persist selections across category switches --- */
let cart = {};          // { [id]: { dine: number, take: number } }
let addModalCart = {};  // { [id]: number } // modal per-open session

// keeps unsaved stock-in quantities while the stock panel is open
let stockInDraft = null;   // { [itemId]: number }

/* ---------- Helpers ---------- */
const LSget = (k, fb) => { try { return JSON.parse(localStorage.getItem(k) || fb);} catch { return JSON.parse(fb);} };
const LSset = (k, v) => localStorage.setItem(k, JSON.stringify(v));

const getAllItems = () => Object.values(CATALOG).flat();
const getItemById = (id) => getAllItems().find(x => x.id === id);
const getCategories = () => Object.keys(CATALOG);
const getCategoryByItemId = (id) => {
  for (const [cat, items] of Object.entries(CATALOG)) {
    if (items.some(x => x.id === id)) return cat;
  }
  return "";
};

function getCartEntry(id){
  if(!cart[id]) cart[id] = { dine: 0, take: 0 };
  return cart[id];
}
function setCartDine(id, v){ getCartEntry(id).dine = Math.max(0, Number(v)||0); }
function setCartTake(id, v){ getCartEntry(id).take = Math.max(0, Number(v)||0); }

/* Category state */
let currentCategoryName = getCategories()[0] || "Tresleches";   // main page
let stockActiveCategory = currentCategoryName;                  // stock panel
let manageActiveCategory = stockActiveCategory;                 // ON/OFF modal
let addActiveCategory = currentCategoryName;                    // Add Item modal

/* Active ON/OFF map */
function loadActiveMap(){
  let map = LSget(ACTIVE_KEY, "null");
  if(!map || typeof map !== "object"){
    map = {};
    getAllItems().forEach(x => map[x.id] = true);
    LSset(ACTIVE_KEY, map);
  }
  getAllItems().forEach(x => { if(!(x.id in map)) map[x.id] = true; });
  return map;
}
function saveActiveMap(map){ LSset(ACTIVE_KEY, map); }
function isActive(id){ return !!loadActiveMap()[id]; }

/* Stock helpers */
function loadStock(){
  const raw = LSget(STOCK_KEY, "{}");
  const s = { ...raw };
  getAllItems().forEach(x => { if(!(x.id in s)) s[x.id] = parseInt(raw[x.id] || 0,10); });
  return s;
}
function saveStock(s){ LSset(STOCK_KEY, s); updateStockButton(); updateStockBadges(); }
function updateStockButton(){
  const total = Object.values(loadStock()).reduce((a,b)=>a+b,0);
  stockTotalEl.textContent = total;
}
function updateStockBadges(){
  const stock = loadStock();
  document.querySelectorAll(".cake").forEach(card => {
    const id = card.dataset.id;
    let b = card.querySelector(".stock-badge");
    if(!b){ b=document.createElement("div"); b.className="stock-badge"; card.appendChild(b); }
    b.textContent = `Stock: ${stock[id]||0}`;
  });
}
function addStockInRecord(id, qty){
  if(!qty) return;
  const log = LSget(STOCK_IN_KEY, "[]");
  log.push({ dateISO: new Date().toISOString(), id, qty:Number(qty) });
  LSset(STOCK_IN_KEY, log);
}
function addStockOutRecord(id, qty){
  if(!qty) return;
  const log = LSget(STOCK_OUT_KEY, "[]");
  log.push({ dateISO: new Date().toISOString(), id, qty:Number(qty) });
  LSset(STOCK_OUT_KEY, log);
}

/* ---------- Category pills ---------- */
function buildCategoryTabs(containerEl, activeName, onChange){
  containerEl.innerHTML = "";
  getCategories().forEach(name=>{
    const btn = document.createElement("button");
    btn.className = "pill" + (name===activeName ? " active" : "");
    btn.textContent = name;
    btn.addEventListener("click", ()=>{
      const prev = containerEl.querySelector(".pill.active");
      if(prev) prev.classList.remove("active");
      btn.classList.add("active");
      onChange(name);
    });
    containerEl.appendChild(btn);
  });
}

/* ---------- Main grid ---------- */
function buildCakeGrid(){
  cakeGrid.innerHTML = "";
  const items = (CATALOG[currentCategoryName] || []).filter(x => isActive(x.id));

  items.forEach(meta => {
    const card = document.createElement("div");
    card.className = "cake";
    card.dataset.id = meta.id;
    card.dataset.price = meta.price;

    const img = document.createElement("img");
    img.src = meta.img || "images/placeholder.png";
    img.alt = meta.label;
    img.className = "cake-img";
    card.appendChild(img);

    const name = document.createElement("div");
    name.className = "cake-name";
    name.textContent = meta.label;
    card.appendChild(name);

    row("Dine-in", "dine");
    row("Take-away", "take");
    cakeGrid.appendChild(card);

    function row(label, field){
      const group = document.createElement("div");
      group.className = "count-group";

      const l = document.createElement("div");
      l.className = "count-label";
      l.textContent = label;

      const ctr = document.createElement("div");
      ctr.className = "qty-controls";

      const minus = button("−");
      const plus  = button("+");
      const input = numberInput();

      // seed from cart
      const entry = getCartEntry(meta.id);
      input.value = field === "dine" ? entry.dine : entry.take;

      minus.addEventListener("click", ()=>{
        const v = Math.max(0, Number(input.value||0) - 1);
        input.value = v;
        field === "dine" ? setCartDine(meta.id, v) : setCartTake(meta.id, v);
        recalcSummaryFromCart();
      });
      plus.addEventListener("click", ()=>{
        const v = Number(input.value||0) + 1;
        input.value = v;
        field === "dine" ? setCartDine(meta.id, v) : setCartTake(meta.id, v);
        recalcSummaryFromCart();
      });
      input.addEventListener("input", ()=>{
        const v = Math.max(0, Number(input.value||0));
        field === "dine" ? setCartDine(meta.id, v) : setCartTake(meta.id, v);
        recalcSummaryFromCart();
      });

      ctr.append(minus,input,plus);
      group.append(l,ctr);
      card.appendChild(group);
    }
  });

  updateStockBadges();

  function button(t){ const b=document.createElement("button"); b.className="secondary"; b.textContent=t; return b; }
  function numberInput(){ const i=document.createElement("input"); i.type="number"; i.min=0; i.step=1; i.value=0; return i; }
}

/* ---------- Totals from cart ---------- */
function recalcSummaryFromCart(){
  let dine=0, take=0, amount=0;

  Object.entries(cart).forEach(([id, q])=>{
    const meta = getItemById(id); if(!meta) return;
    const d = q?.dine||0, t = q?.take||0;
    dine += d; take += t;
    amount += (d+t)*(meta.price||0) + t*TAKEAWAY_CHARGE;
  });

  const total = dine + take;
  totalCakesInput.value = String(total);
  amountSummary.textContent = `Total Amount: ₹${amount}`;
  return { dineTotal: dine, takeTotal: take, computedTotal: total, amount };
}

/* ---------- Collect selection ---------- */
function collectSelection(){
  const totals = recalcSummaryFromCart();
  const items = [];
  Object.entries(cart).forEach(([id, q])=>{
    const d = q?.dine||0, t = q?.take||0;
    if(d>0 || t>0){
      const meta = getItemById(id);
      items.push({
        id,
        label: meta?.label || id,
        category: getCategoryByItemId(id),
        price: meta?.price || 0,
        dine: d,
        take: t
      });
    }
  });
  return { totals, items };
}

/* ---------- Start Dine-in ---------- */
document.getElementById("startDineInBtn").addEventListener("click", () => {
  const { totals, items } = collectSelection();
  if (totals.computedTotal === 0) { alert("Select some items first."); return; }

  const q = LSget(DINE_QUEUE_KEY, "[]");
  q.push({ orderId, customerType, createdAt: new Date().toISOString(), items, status: "in_progress" });
  LSset(DINE_QUEUE_KEY, q);

  // clear cart for next order
  cart = {};
  buildCakeGrid();
  recalcSummaryFromCart();

  orderId++; localStorage.setItem("nextOrderId", String(orderId));
  document.getElementById("currentOrderId").textContent = orderId;

  resetTopPaymentForm();
  renderDineList();
  document.getElementById("dineInHeading").scrollIntoView({ behavior: "smooth" });
});

/* ---------- Payment form ---------- */
function resetTopPaymentForm(){
  paymentModeEl.value = '';
  cashUpiDetails.style.display = 'none';
  cashAmountInput.value = '';
  upiAmountInput.value  = '';
}
if(!paymentModeEl.querySelector('option[value=""]')){
  const opt0 = new Option('In Progress','',true,true); opt0.disabled=true; paymentModeEl.prepend(opt0);
}
paymentModeEl.value='';
cashUpiDetails.style.display='none';
paymentModeEl.addEventListener("change", ()=>{
  if(paymentModeEl.value === "Cash+UPI") cashUpiDetails.style.display='block';
  else { cashUpiDetails.style.display='none'; cashAmountInput.value=''; upiAmountInput.value=''; }
});

/* ---------- Direct Save ---------- */
saveBtn.addEventListener("click", async ()=>{
  const { totals, items } = collectSelection();
  if (totals.computedTotal === 0) { alert("No items selected."); return; }

  if (!paymentModeEl.value) {
    alert("Select a payment mode (Cash / UPI / Cash+UPI) before saving.");
    return;
  }

  // stock check
  const per = {};
  items.forEach(i => per[i.id] = (per[i.id]||0) + i.dine + i.take);
  const stock = loadStock();
  const lacking = [];
  Object.keys(per).forEach(id=>{
    if((stock[id]||0) < per[id]) lacking.push(`${getItemById(id)?.label || id} (need ${per[id]}, have ${stock[id]||0})`);
  });
  if(lacking.length){ alert("Insufficient stock for:\n"+lacking.join("\n")); return; }

  let paymentMode = paymentModeEl.value;
  let paymentInfo = "";
  if(paymentMode === "Cash+UPI"){
    paymentInfo = `Cash: ${parseFloat(cashAmountInput.value||0)} | UPI: ${parseFloat(upiAmountInput.value||0)}`;
  }

  const now = new Date();
  const sale = {
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
    orderId,
    typeOfCustomer: customerType,
    totalCakes: totals.computedTotal,
    flavorsDine: items.filter(i=>i.dine>0)
                      .map(i => `${i.category || getCategoryByItemId(i.id)} — ${i.label} x${i.dine}`),
    flavorsTake: items.filter(i=>i.take>0)
                      .map(i => `${i.category || getCategoryByItemId(i.id)} — ${i.label} x${i.take}`),
    amount: totals.amount,
    paymentMode,
    paymentInfo
  };

  const sales = LSget(SALES_KEY, "[]"); sales.push(sale); LSset(SALES_KEY, sales);

  // reduce stock
  Object.keys(per).forEach(id => { stock[id] -= per[id]; addStockOutRecord(id, per[id]); });
  saveStock(stock);

  // prepare next order
  orderId++; localStorage.setItem("nextOrderId", String(orderId));
  document.getElementById("currentOrderId").textContent = orderId;

  cart = {};
  buildCakeGrid();
  recalcSummaryFromCart();

  resetTopPaymentForm();
  alert("Order saved.");
});

/* ---------- Dine-in list ---------- */
function renderDineList(){
  dineList.innerHTML='';
  const all = LSget(DINE_QUEUE_KEY,'[]');

  const term = (dineSearchInput?.value || '').trim().toLowerCase();
  const list = !term ? all : all.filter(o=>{
    const idHit = String(o.orderId).includes(term);
    const itemHit = (o.items||[]).some(it => (it.label||"").toLowerCase().includes(term));
    const customerHit = (o.customerType||'').toLowerCase().includes(term);
    return idHit || itemHit || customerHit;
  });

  if(list.length===0){
    const msg=document.createElement('div'); msg.className='muted';
    msg.textContent = term ? 'No matching dine-in orders.' : 'No dine-in orders yet.';
    dineList.appendChild(msg); return;
  }

  list.forEach(ord=>{
    const card=document.createElement('div'); card.className='dine-card';

    const head=document.createElement('div'); head.className='dine-card-head';
    head.innerHTML = `<div><b>Order ID :</b> ${ord.orderId}</div><div class="dine-status">(In progress)</div>`;
    card.appendChild(head);

    const linesWrap=document.createElement('div'); linesWrap.className='dine-lines';

    const renderLines=(label, field)=>{
      const header=document.createElement('div'); header.style.fontWeight='600'; header.textContent=label;
      let has=false;
      (ord.items||[]).forEach(it=>{
        const qty = it[field]||0; if(qty<=0) return;
        if(!has){ linesWrap.appendChild(header); has=true; }
        const row=document.createElement('div'); row.className='dine-line';
        const left=document.createElement('div'); left.className='name';
        const cat = it.category || getCategoryByItemId(it.id) || "";
        left.innerHTML = `<span class="tag">${label==='Dine-in'?'Dine':'Take'}</span>${cat ? `<strong>${cat}</strong> — ` : ""}${it.label}`;
        const qtyops=document.createElement('div'); qtyops.className='qtyops';
        const minus=smallBtn('−'), plus=smallBtn('+'), del=smallBtn('🗑');
        const qtySpan=document.createElement('span'); qtySpan.className='qty'; qtySpan.textContent=qty;
        minus.addEventListener('click',()=>adjustItemQty(ord.orderId,it.id,field,-1));
        plus.addEventListener('click',()=>adjustItemQty(ord.orderId,it.id,field,+1));
        del.addEventListener('click',()=>setItemQty(ord.orderId,it.id,field,0));
        qtyops.append(minus,qtySpan,plus,del);
        row.append(left,document.createElement('div'),qtyops);
        linesWrap.appendChild(row);
      });
    };
    renderLines('Dine-in','dine');
    renderLines('Takeaway','take');
    card.appendChild(linesWrap);

    const totals = calcTotals(ord.items||[]);
    const totalDiv=document.createElement('div'); totalDiv.className='dine-totals';
    totalDiv.textContent = `Total : ${totals.count} (₹${totals.amount})`;
    card.appendChild(totalDiv);

    const footer=document.createElement('div'); footer.className='dine-footer';
    const created=new Date(ord.createdAt);
    const dt=document.createElement('div'); dt.innerHTML=`Date: ${created.toLocaleDateString()} &nbsp;&nbsp; Time: ${created.toLocaleTimeString()}`;

    const actions=document.createElement('div'); actions.className='dine-actions';
    const addBtn=document.createElement('button'); addBtn.className='secondary'; addBtn.textContent='Add Item';
    const endBtn=document.createElement('button'); endBtn.className='primary'; endBtn.textContent='End Order';

    const paySel=document.createElement('select'); paySel.className='dine-payment'; paySel.style.display='none';
    const opt0 = new Option("In Progress","",true,true); opt0.disabled=true; paySel.add(opt0);
    ["Cash","UPI","Cash+UPI"].forEach(v=> paySel.add(new Option(v,v)));

    const mini=document.createElement('div'); mini.className='mini-amounts'; mini.style.display='none';
    const cashInp=document.createElement('input'); cashInp.type='number'; cashInp.placeholder='Cash ₹'; cashInp.min=0;
    const upiInp =document.createElement('input'); upiInp.type='number';  upiInp.placeholder='UPI ₹';  upiInp.min=0;
    mini.append(cashInp,upiInp);

    const saveFinal=document.createElement('button'); saveFinal.className='primary'; saveFinal.textContent='Save Order'; saveFinal.style.display='none'; saveFinal.disabled=true;

    addBtn.addEventListener('click',()=>openAddItemModal(ord.orderId));
    endBtn.addEventListener('click',()=>{ endBtn.style.display='none'; addBtn.style.display='none'; paySel.style.display='inline-block'; saveFinal.style.display='inline-block';});
    paySel.addEventListener('change',()=>{ saveFinal.disabled=!paySel.value; if(paySel.value==='Cash+UPI') mini.style.display='flex'; else { mini.style.display='none'; cashInp.value=''; upiInp.value=''; }});
    saveFinal.addEventListener('click',()=>{
      const pm=paySel.value||''; if(!pm){ alert('Select payment mode (Cash / UPI / Cash+UPI) before saving'); return; }
      const c=pm==='Cash+UPI'?parseFloat(cashInp.value||0):0;
      const u=pm==='Cash+UPI'?parseFloat(upiInp.value||0):0;
      finalizeDineOrder(ord.orderId, pm, c, u);
    });

    actions.append(addBtn,endBtn,paySel,mini,saveFinal);
    footer.append(dt,actions); card.appendChild(footer);
    dineList.appendChild(card);

    function smallBtn(t){ const b=document.createElement('button'); b.className='secondary'; b.style.padding='4px 8px'; b.textContent=t; return b; }
  });
}

function calcTotals(items){
  let dine=0, take=0, amount=0;
  (items||[]).forEach(i=>{
    const price = i.price ?? getItemById(i.id)?.price ?? 0;
    dine += i.dine||0; take += i.take||0;
    amount += ((i.dine||0) + (i.take||0))*price + (i.take||0)*TAKEAWAY_CHARGE;
  });
  return { dine, take, count: dine+take, amount };
}
function adjustItemQty(orderId, id, field, delta){
  const q = LSget(DINE_QUEUE_KEY,'[]');
  const ord = q.find(o=>o.orderId===orderId); if(!ord) return;
  const it  = (ord.items||[]).find(i=>i.id===id); if(!it) return;
  it[field] = Math.max(0, (it[field]||0) + delta);
  LSset(DINE_QUEUE_KEY, q); renderDineList();
}
function setItemQty(orderId, id, field, value){
  const q = LSget(DINE_QUEUE_KEY,'[]');
  const ord = q.find(o=>o.orderId===orderId); if(!ord) return;
  const it  = (ord.items||[]).find(i=>i.id===id); if(!it) return;
  it[field] = value;
  LSset(DINE_QUEUE_KEY, q); renderDineList();
}

/* ---------- Add Item modal ---------- */
function openAddItemModal(orderId){
  addItemTargetOrderId = orderId;
  addActiveCategory = currentCategoryName; // start from current
  addModalCart = {};                       // fresh per open
  addSearch.value = "";

  buildCategoryTabs(addCategoryTabsEl, addActiveCategory, (name)=>{
    addActiveCategory = name;
    renderAddCards();
  });

  renderAddCards();
  addItemModal.classList.remove("hidden");
}
closeAddItemBtn.addEventListener("click", ()=> addItemModal.classList.add("hidden"));
addSearch.addEventListener("input", renderAddCards);

confirmAddSelectedBtn.addEventListener("click", ()=>{
  const q = LSget(DINE_QUEUE_KEY,'[]');
  const ord = q.find(o=>o.orderId===addItemTargetOrderId);
  if(!ord){ alert("Order not found"); return; }
  const type = addType.value;
  let changed=false;

  Object.entries(addModalCart).forEach(([id,qty])=>{
    const n = Number(qty)||0; if(n<=0) return;
    let item = (ord.items||[]).find(i=>i.id===id);
    if(!item){
      const meta = getItemById(id);
      item = { id, label: meta?.label||id, category: getCategoryByItemId(id), price: meta?.price||0, dine:0, take:0 };
      ord.items.push(item);
    }
    if(type==='dine') item.dine = (item.dine||0) + n; else item.take = (item.take||0) + n;
    changed=true;
  });

  if(!changed){ alert("No quantities selected."); return; }
  LSset(DINE_QUEUE_KEY, q);
  addItemModal.classList.add("hidden");
  renderDineList();
});

function renderAddCards(){
  const items = (CATALOG[addActiveCategory]||[]).filter(x=>isActive(x.id));
  const term = addSearch.value.trim().toLowerCase();
  addCardsGrid.innerHTML = "";

  items.filter(x => !term || x.label.toLowerCase().includes(term) || x.id.toLowerCase().includes(term))
       .forEach(meta=>{
          const card=document.createElement("div"); card.className="addcard";
          const img=document.createElement("img"); img.src=meta.img||"images/placeholder.png"; img.alt=meta.label; card.appendChild(img);
          const title=document.createElement("div"); title.className="title"; title.textContent=meta.label;

          const qtyrow=document.createElement("div"); qtyrow.className="qtyrow";
          const minus=smallBtn("−"); const plus=smallBtn("+");
          const qty=inputNum(addModalCart[meta.id] || 0);

          minus.addEventListener("click", ()=>{ qty.value=Math.max(0,Number(qty.value||0)-1); addModalCart[meta.id]=Number(qty.value)||0; });
          plus .addEventListener("click", ()=>{ qty.value=Number(qty.value||0)+1; addModalCart[meta.id]=Number(qty.value)||0; });
          qty.addEventListener("input", ()=>{ addModalCart[meta.id]=Math.max(0,Number(qty.value||0)); });

          qtyrow.append(minus,qty,plus);
          card.append(title,qtyrow);
          addCardsGrid.appendChild(card);
       });

  function smallBtn(t){ const b=document.createElement("button"); b.className="secondary"; b.textContent=t; b.style.padding="6px 10px"; return b; }
  function inputNum(v){ const i=document.createElement("input"); i.type="number"; i.min=0; i.step=1; i.value=v; return i; }
}

/* ---------- Finalize dine-in ---------- */
function finalizeDineOrder(orderIdToSave, paymentMode, cashAmt=0, upiAmt=0){
  const q = LSget(DINE_QUEUE_KEY,'[]');
  const idx = q.findIndex(o=>o.orderId===orderIdToSave); if(idx<0) return;
  const ord = q[idx];

  const per = {};
  (ord.items||[]).forEach(i => per[i.id]=(per[i.id]||0) + (i.dine||0) + (i.take||0));
  const stock = loadStock();
  const lacking = [];
  Object.keys(per).forEach(id => { if((stock[id]||0) < per[id]) lacking.push(`${getItemById(id)?.label||id} (need ${per[id]}, have ${stock[id]||0})`); });
  if(lacking.length){ alert("Insufficient stock:\n"+lacking.join("\n")); return; }

  Object.keys(per).forEach(id => { stock[id]-=per[id]; addStockOutRecord(id, per[id]); });
  saveStock(stock);

  const totals = calcTotals(ord.items||[]);
  const when = new Date(ord.createdAt);
  const sale = {
    date: when.toLocaleDateString(),
    time: when.toLocaleTimeString(),
    orderId: ord.orderId,
    typeOfCustomer: ord.customerType || "Customer",
    totalCakes: totals.count,
    flavorsDine: (ord.items||[]).filter(i=>i.dine>0)
                .map(i=>`${i.category || getCategoryByItemId(i.id)} — ${i.label} x${i.dine}`),
    flavorsTake: (ord.items||[]).filter(i=>i.take>0)
                .map(i=>`${i.category || getCategoryByItemId(i.id)} — ${i.label} x${i.take}`),
    amount: totals.amount,
    paymentMode,
    paymentInfo: paymentMode === "Cash+UPI" ? `Cash: ${Number(cashAmt||0)} | UPI: ${Number(upiAmt||0)}` : ""
  };
  const sales = LSget(SALES_KEY,"[]"); sales.push(sale); LSset(SALES_KEY, sales);

  q.splice(idx,1); LSset(DINE_QUEUE_KEY, q);
  renderDineList();
  alert("Order saved.");
}

/* ---------- Completed orders panel ---------- */
function openCompletedPanel(){
  completedList.innerHTML="";
  const sales = LSget(SALES_KEY,"[]");
  if(sales.length===0){
    completedList.innerHTML = '<p class="muted">No completed orders yet.</p>';
  }else{
    sales.slice().reverse().forEach(s=>{
      const wrap=document.createElement("div"); wrap.className="completed-item";
      const head=document.createElement("div"); head.className="completed-head"; head.innerHTML=`<div>Order #${s.orderId}</div><div>${s.date} ${s.time}</div>`; wrap.appendChild(head);
      const lines=document.createElement("div"); lines.className="completed-lines";
      [...(s.flavorsDine||[]), ...(s.flavorsTake||[])].forEach(l=>{ const p=document.createElement("div"); p.textContent=l; lines.appendChild(p); });
      const tot=document.createElement("div"); tot.style.marginTop="6px"; tot.innerHTML=`<b>Total:</b> ${s.totalCakes} (₹${s.amount})`; lines.appendChild(tot);
      const pay=document.createElement("div"); pay.style.marginTop="4px"; pay.innerHTML=`<b>Payment:</b> ${s.paymentMode}${s.paymentInfo?` — ${s.paymentInfo}`:""}`; lines.appendChild(pay);
      wrap.appendChild(lines); completedList.appendChild(wrap);
    });
  }
  completedPanel.classList.remove("hidden");
}

/* ---------- Stock & Manage Items ---------- */
stockBtn.addEventListener("click", openStockPanel);
closeStockBtn.addEventListener("click", ()=> { stockInDraft = null; stockPanel.classList.add("hidden")});
saveStockBtn.addEventListener("click", saveStockInFromPanel);
resetStockBtn.addEventListener("click", resetAllStock);

function openStockPanel(){
  stockInDraft = stockInDraft || {}; // start a fresh draft if not already
  buildCategoryTabs(stockCategoryTabsEl, stockActiveCategory, (name)=>{
    stockActiveCategory = name;
    manageActiveCategory = name; // keep ON/OFF modal in sync
    renderStockCards();
  });
  renderStockCards();
  stockPanel.classList.remove("hidden");
}

function renderStockCards(){
  stockListEl.innerHTML="";
  const stock = loadStock();

  // "On Start" store (today's brought-in)
  let startStock = LSget("startOfDayStock","{}");
  if(Object.keys(startStock).length===0){ startStock = {...stock}; LSset("startOfDayStock", startStock); }

  (CATALOG[stockActiveCategory]||[]).filter(x=>isActive(x.id)).forEach(meta=>{
    const card=document.createElement("div"); card.className="stock-card";
    const img=document.createElement("img"); img.src=meta.img||"images/placeholder.png"; img.alt=meta.label; card.appendChild(img);
    const title=document.createElement("div"); title.className="title"; title.textContent = meta.label;
    const metaDiv=document.createElement("div"); metaDiv.className="meta";
    metaDiv.innerHTML = `<span>On Start: ${startStock[meta.id]??0}</span><span>Current: ${stock[meta.id]||0}</span>`;
    const qtyrow=document.createElement("div"); qtyrow.className="qtyrow";
    const minus=smallBtn("−"); const plus=smallBtn("+");
    const input=document.createElement("input"); input.type="number"; input.min=0; input.step=1; input.value=0; input.dataset.id = meta.id; input.className="stock-in-input";
     // ⬇️ seed from draft (persisted while panel is open)
     const seed = (stockInDraft && typeof stockInDraft[meta.id] === "number") ? stockInDraft[meta.id]: 0;
     input.value = seed;

     // keep draft updated
     const setDraft =(v)=>{ v = Math.max(0, parseInt(v||"0",10) || 0); input.value = v; if(!stockInDraft) stockInDraft = {}; stockInDraft[meta.id] = v;};
    minus.addEventListener("click", ()=> setDraft((parseInt(input.value||"0",10) || 0) - 1));
    plus .addEventListener("click", ()=> setDraft((parseInt(input.value||"0",10) || 0) + 1));
    input.addEventListener("input",   ()=> setDraft(input.value));
    qtyrow.append(minus,input,plus);
    card.append(title,metaDiv,qtyrow);
    stockListEl.appendChild(card);
  });

  function smallBtn(t){ const b=document.createElement("button"); b.className="secondary"; b.textContent=t; return b; }
}

function saveStockInFromPanel(){
  const stock  = loadStock();
  let startStock = LSget("startOfDayStock","{}");
  let any = false;

  // use the draft (covers items from *any* category the user touched)
  const entries = Object.entries(stockInDraft || {});
  entries.forEach(([id, qtyRaw])=>{
    const qty = parseInt(qtyRaw || "0", 10) || 0;
    if (qty > 0) {
      stock[id] = (stock[id] || 0) + qty;           // Current
      startStock[id] = (startStock[id] || 0) + qty; // On Start
      addStockInRecord(id, qty);
      any = true;
    }
  });

  if (!any) { alert("No stock changes entered."); return; }

  saveStock(stock);
  LSset("startOfDayStock", startStock);

  stockInDraft = null; // ✅ clear after saving
  alert("Stock updated.");
  stockPanel.classList.add("hidden");
}


function resetAllStock(){
  if(!confirm("Reset ALL stock counts to 0?")) return;

  const s = {}, start = {};
  getAllItems().forEach(x => { s[x.id] = 0; start[x.id] = 0; });

  saveStock(s);
  LSset("startOfDayStock", start);
  alert("All stock reset to 0.");
  stockPanel.classList.add("hidden");
}

/* Manage Items (ON/OFF) */
if(manageItemsBtn) manageItemsBtn.addEventListener("click", openManageItems);
if(closeManageItemsBtn) closeManageItemsBtn.addEventListener("click", ()=> manageItemsModal.classList.add("hidden"));
if(saveManageItemsBtn)  saveManageItemsBtn.addEventListener("click", saveManageItems);

function openManageItems(){
  buildCategoryTabs(manageCategoryTabsEl, manageActiveCategory, (name)=>{
    manageActiveCategory = name;
    renderManageItemsGrid();
  });
  renderManageItemsGrid();
  manageItemsModal.classList.remove("hidden");
}

function renderManageItemsGrid(){
  manageItemsGrid.innerHTML="";
  const active = loadActiveMap();
  (CATALOG[manageActiveCategory]||[]).forEach(meta=>{
    const card=document.createElement("div"); card.className="manage-card";
    const img=document.createElement("img"); img.src=meta.img||"images/placeholder.png"; img.alt=meta.label; card.appendChild(img);
    const title=document.createElement("div"); title.className="title"; title.textContent=meta.label;
    const label=document.createElement("label"); label.className="switch";
    const input=document.createElement("input"); input.type="checkbox"; input.checked=!!active[meta.id]; input.dataset.id=meta.id;
    const slider=document.createElement("span"); slider.className="slider";
    label.append(input,slider); card.appendChild(label);
    manageItemsGrid.appendChild(card);
  });
}

function saveManageItems(){
  const map=loadActiveMap();
  manageItemsGrid.querySelectorAll('input[type="checkbox"][data-id]').forEach(ch=>{
    map[ch.dataset.id] = ch.checked;
  });
  saveActiveMap(map);
  manageItemsModal.classList.add("hidden");
  buildCakeGrid();
  recalcSummaryFromCart();
  renderDineList();
  if(!stockPanel.classList.contains("hidden")) openStockPanel();
}

/* ---------- Search & misc ---------- */
if(dineSearchInput) dineSearchInput.addEventListener("input", ()=> renderDineList());
if(clearDineSearch){ clearDineSearch.addEventListener("click", ()=>{ dineSearchInput.value=""; renderDineList(); }); }
scrollDineInBtn.addEventListener("click", ()=> document.getElementById("dineInHeading").scrollIntoView({behavior:"smooth"}));
document.getElementById("importBtnTop").addEventListener("click", ()=> alert("Import: share CSV/JSON format to implement."));

/* ---------- Init ---------- */
(function ensureStockInitialized(){
  const raw = localStorage.getItem(STOCK_KEY);
  const s = raw ? JSON.parse(raw) : {};
  getAllItems().forEach(x=>{ if(!(x.id in s)) s[x.id]=0; });
  localStorage.setItem(STOCK_KEY, JSON.stringify(s));
  updateStockButton();
})();

buildCategoryTabs(categoryTabsEl, currentCategoryName, (name)=>{
  currentCategoryName = name;
  buildCakeGrid();
  recalcSummaryFromCart();

  // keep Add Item modal in sync if open
  if(!addItemModal.classList.contains("hidden")) {
    addActiveCategory = name;
    buildCategoryTabs(addCategoryTabsEl, addActiveCategory, (n)=>{ addActiveCategory=n; renderAddCards(); });
    renderAddCards();
  }
});
buildCakeGrid();
recalcSummaryFromCart();
updateStockBadges();
renderDineList();
