/* ---------- Catalogue data (matches the sample table in the lab sheet) ---------- */
const BOOKS = [
  { dept:"CSE",   title:"XML Bible",        author:"Winston",   publisher:"Wiely",            price:40.5, color:"#6B2438" },
  { dept:"ECE",   title:"AI",               author:"S. Russel", publisher:"Princetonhall",    price:63.0, color:"#2E5339" },
  { dept:"EEE",   title:"Java 2",           author:"Watson",    publisher:"BPB Publications",  price:35.5, color:"#3B4A6B" },
  { dept:"CIVIL", title:"HTML in 24 Hours", author:"Sam Peter", publisher:"Sam Publication",   price:50.0, color:"#8A5A2A" },
  // CSE
  { dept:"CSE",   title:"Introduction to Algorithms", author:"Cormen",         publisher:"MIT Press",       price:72.0, color:"#4A3B6B" },
  { dept:"CSE",   title:"Operating System Concepts",  author:"Silberschatz",   publisher:"Wiley",           price:58.0, color:"#7A2E2E" },
  { dept:"CSE",   title:"Computer Networks",          author:"Tanenbaum",      publisher:"Pearson",         price:55.5, color:"#2F5D62" },
  { dept:"CSE",   title:"Database System Concepts",   author:"Korth",          publisher:"McGraw-Hill",     price:61.0, color:"#5B4A2A" },
  // ECE
  { dept:"ECE",   title:"Digital Signal Processing",  author:"Proakis",        publisher:"Pearson",         price:54.0, color:"#35506B" },
  { dept:"ECE",   title:"Microelectronic Circuits",   author:"Sedra & Smith",  publisher:"Oxford",          price:66.0, color:"#4B5D2E" },
  { dept:"ECE",   title:"Communication Systems",      author:"Haykin",         publisher:"Wiley",           price:48.5, color:"#6B3A4F" },
  // EEE
  { dept:"EEE",   title:"Power System Analysis",      author:"Grainger",       publisher:"McGraw-Hill",     price:57.0, color:"#8A6A2A" },
  { dept:"EEE",   title:"Electric Machinery",         author:"Fitzgerald",     publisher:"McGraw-Hill",     price:52.0, color:"#2E4A5E" },
  { dept:"EEE",   title:"Control Systems Engineering",author:"Nise",           publisher:"Wiley",           price:49.0, color:"#5E2E48" },
  // CIVIL
  { dept:"CIVIL", title:"Structural Analysis",        author:"Hibbeler",       publisher:"Pearson",         price:59.0, color:"#6B5A3B" },
  { dept:"CIVIL", title:"Soil Mechanics",             author:"Das",            publisher:"Cengage",         price:46.0, color:"#3E5E4B" },
  { dept:"CIVIL", title:"Fluid Mechanics",            author:"White",          publisher:"McGraw-Hill",     price:53.5, color:"#2B4B6F" },
];

/* Escape text/attribute values before putting them into HTML */
function esc(s){
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}


const DEPT_META = {
  CSE:   { icon:"💻", name:"Computer Science" },
  ECE:   { icon:"📡", name:"Electronics & Comm." },
  EEE:   { icon:"⚡", name:"Electrical" },
  CIVIL: { icon:"🏗️", name:"Civil" }
};
function bookByTitle(t){ return BOOKS.find(b => b.title === t); }

/* Small toast message (replaces alert()) */
function showToast(msg, type){
  let box = document.getElementById("toastBox");
  if (!box){
    box = document.createElement("div");
    box.id = "toastBox";
    box.setAttribute("aria-live", "polite");
    document.body.appendChild(box);
  }
  const t = document.createElement("div");
  t.className = "toast " + (type || "");
  t.textContent = msg;
  box.appendChild(t);
  setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, 2400);
}

/* Cart / wishlist counters in the top bar (updates live across frames) */
function updateBadges(){
  const count = Object.values(loadCart()).reduce((n, i) => n + i.qty, 0);
  const wish = loadWishlist().length;
  [["cartBadge", count], ["wishBadge", wish]].forEach(([id, n]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = n;
    el.hidden = n === 0;
  });
}
window.addEventListener("storage", () => { updateBadges(); renderTopBar(); });

/* Highlight the active link in the top bar and side panel */
function setActive(key){
  const file = key.split("?")[0];
  document.querySelectorAll("[data-nav]").forEach(a => {
    const href = a.getAttribute("href");
    a.classList.toggle("active", href === key || (!href.includes("?") && href === file));
  });
}
function announcePage(){
  if (window.parent === window) return;
  const key = (location.pathname.split("/").pop() || "home.html") + location.search;
  try { ["topFrame", "navFrame"].forEach(n => { const w = parent.frames[n]; if (w && w.setActive) w.setActive(key); }); } catch(e){}
}
function pullActive(){
  try {
    const m = parent.frames["mainFrame"];
    if (m) setActive(m.location.pathname.split("/").pop() + m.location.search);
  } catch(e){}
}

function coverSwatch(title, color, author, size){
  return `<div class="cover cover-${size || "sm"}" style="--c:${color}">
    <span class="cover-title">${esc(title)}</span>${author ? `<span class="cover-author">${esc(author)}</span>` : ""}</div>`;
}

/* One book card — used by the catalogue, home page and wishlist */
function bookCard(b, mode){
  const wished = isWished(b.title);
  const inCart = (loadCart()[b.title] || {}).qty || 0;
  const heart = mode === "wishlist" ? "" :
    `<button type="button" class="heart ${wished ? "on" : ""}" data-wish="${esc(b.title)}" aria-pressed="${wished}"
       aria-label="${wished ? "Remove from" : "Add to"} wishlist" title="${wished ? "Remove from" : "Add to"} wishlist">♥</button>`;
  const actions = mode === "wishlist"
    ? `<button type="button" class="btn" data-move="${esc(b.title)}">Move to cart</button>
       <button type="button" class="btn ghost" data-unwish="${esc(b.title)}">Remove</button>`
    : `<button type="button" class="btn" data-add="${esc(b.title)}">Add to cart</button>`;
  return `
    <article class="book-card">
      ${heart}
      <div class="book-cover">${coverSwatch(b.title, b.color, b.author, "lg")}</div>
      <div class="book-info">
        <span class="tag">${esc(b.dept)}</span>
        <h3>${esc(b.title)}</h3>
        <p class="by">by ${esc(b.author)}</p>
        <p class="pub">${esc(b.publisher)}</p>
        ${inCart ? `<p class="in-cart">✓ ${inCart} in your cart</p>` : ""}
        <div class="book-buy"><span class="price">$${b.price.toFixed(2)}</span><div class="book-actions">${actions}</div></div>
      </div>
    </article>`;
}

function renderCatalogue(){
  const grid = document.getElementById("catGrid");
  if (!grid) return;
  const dept = new URLSearchParams(window.location.search).get("dept");
  document.getElementById("catTitle").textContent = dept ? `${(DEPT_META[dept] || {}).name || dept} books` : "All books";
  document.querySelectorAll(".chip[data-dept]").forEach(c => c.classList.toggle("active", c.dataset.dept === (dept || "")));
  const q = (document.getElementById("catSearch").value || "").trim().toLowerCase();
  const sort = document.getElementById("catSort").value;
  const rows = BOOKS.filter(b => (!dept || b.dept === dept) &&
    (!q || [b.title, b.author, b.publisher].some(x => x.toLowerCase().includes(q))));
  const sorters = {
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    "title": (a, b) => a.title.localeCompare(b.title)
  };
  if (sorters[sort]) rows.sort(sorters[sort]);
  document.getElementById("catCount").textContent = `${rows.length} ${rows.length === 1 ? "book" : "books"}`;
  grid.innerHTML = rows.map(b => bookCard(b)).join("") ||
    `<div class="empty-state"><div class="empty-icon">🔍</div><h3>No books found</h3><p>Try a different search or section.</p></div>`;
}

function setView(v){
  const grid = document.getElementById("catGrid");
  if (!grid) return;
  grid.classList.toggle("list", v === "list");
  document.getElementById("viewGrid").classList.toggle("active", v !== "list");
  document.getElementById("viewList").classList.toggle("active", v === "list");
  try { sessionStorage.setItem("catView", v); } catch(e){}
}

function renderHome(){
  const tiles = document.getElementById("deptTiles");
  if (tiles) tiles.innerHTML = Object.entries(DEPT_META).map(([d, m]) => `
    <a class="dept-tile" href="catalogue.html?dept=${d}">
      <span class="dept-icon">${m.icon}</span>
      <strong>${m.name}</strong>
      <small>${BOOKS.filter(b => b.dept === d).length} titles</small>
    </a>`).join("");
  const feat = document.getElementById("featuredGrid");
  if (feat) feat.innerHTML = ["Introduction to Algorithms", "Digital Signal Processing", "Power System Analysis", "Structural Analysis"]
    .map(bookByTitle).filter(Boolean).map(b => bookCard(b)).join("");
}

/* ---------- Cart (persisted per-browser in localStorage) ---------- */
function loadCart(){
  try { return JSON.parse(localStorage.getItem("cart") || "{}"); }
  catch(e) { return {}; }
}

function saveCart(cart){
  try { localStorage.setItem("cart", JSON.stringify(cart)); }
  catch(e) { /* Storage may be unavailable. */ }
  updateBadges();
}

function addToCart(title, price){
  const cart = loadCart();
  if (cart[title]) cart[title].qty += 1;
  else cart[title] = { price: Number(price), qty: 1 };
  saveCart(cart);
  showToast(`“${title}” added to cart`, "success");
  renderCart();
  renderCatalogue();
  renderHome();
}

function changeQuantity(title, change){
  const cart = loadCart();
  if (!cart[title]) return;

  cart[title].qty += change;
  if (cart[title].qty <= 0) {
    delete cart[title];
  }

  saveCart(cart);
  renderCart();
}

function removeFromCart(title){
  const cart = loadCart();
  delete cart[title];
  saveCart(cart);
  renderCart();
}

function clearCart(){
  const cart = loadCart();
  if (Object.keys(cart).length === 0) {
    renderCart();
    return;
  }

  if (confirm("Are you sure you want to clear your entire cart?")) {
    saveCart({});
    renderCart();
  }
}

function renderCart(){
  const list = document.getElementById("cartItems");
  if (!list) return;
  const { entries, subtotal, shipping, total } = cartTotals();
  const layout = document.getElementById("cartLayout");
  const empty = document.getElementById("emptyMsg");
  const clearBtn = document.getElementById("clearCartBtn");
  if (!entries.length){
    layout.style.display = "none";
    empty.style.display = "block";
    if (clearBtn) clearBtn.disabled = true;
    return;
  }
  layout.style.display = "grid";
  empty.style.display = "none";
  if (clearBtn) clearBtn.disabled = false;

  list.innerHTML = entries.map(([title, item]) => {
    const b = bookByTitle(title) || { color:"#6B2438", author:"" };
    const t = esc(title);
    return `
      <div class="cart-row">
        ${coverSwatch(title, b.color, "", "md")}
        <div class="cart-info">
          <h4>${t}</h4>
          <p class="by">${esc(b.author || "")}</p>
          <p class="unit">$${Number(item.price).toFixed(2)} each</p>
        </div>
        <div class="qty">
          <button type="button" data-qty="-1" data-title="${t}" aria-label="Decrease quantity">−</button>
          <span>${item.qty}</span>
          <button type="button" data-qty="1" data-title="${t}" aria-label="Increase quantity">+</button>
        </div>
        <div class="line-amt">$${(item.price * item.qty).toFixed(2)}</div>
        <button type="button" class="icon-btn" data-remove="${t}" aria-label="Remove ${t}" title="Remove">✕</button>
      </div>`;
  }).join("");

  const remaining = Math.max(0, FREE_SHIPPING_OVER - subtotal);
  const pct = Math.min(100, subtotal / FREE_SHIPPING_OVER * 100);
  document.getElementById("cartSummary").innerHTML = `
    <h3>Order summary</h3>
    <div class="ship-progress">
      ${remaining > 0 ? `Add <strong>$${remaining.toFixed(2)}</strong> more for <strong>free shipping</strong>`
                      : `🎉 You've unlocked <strong>free shipping</strong>`}
      <div class="bar"><span style="width:${pct}%"></span></div>
    </div>
    <dl class="sum">
      <dt>Subtotal</dt><dd>$${subtotal.toFixed(2)}</dd>
      <dt>Shipping</dt><dd>${shipping ? "$" + shipping.toFixed(2) : "Free"}</dd>
      <dt class="grand">Total</dt><dd class="grand">$${total.toFixed(2)}</dd>
    </dl>
    <a class="btn block" href="checkout.html">Proceed to checkout →</a>`;
}

/* ---------- Wishlist (persisted in localStorage as an array of titles) ---------- */
function loadWishlist(){
  try { const w = JSON.parse(localStorage.getItem("wishlist") || "[]"); return Array.isArray(w) ? w : []; }
  catch(e) { return []; }
}
function saveWishlist(list){
  try { localStorage.setItem("wishlist", JSON.stringify(list)); } catch(e) {}
  updateBadges();
}

function isWished(title){ return loadWishlist().includes(title); }

function toggleWishlist(title){
  let list = loadWishlist();
  const adding = !list.includes(title);
  list = adding ? list.concat(title) : list.filter(t => t !== title);
  saveWishlist(list);
  showToast(adding ? `Saved “${title}” to wishlist ♥` : `Removed “${title}” from wishlist`);
  renderCatalogue();
  renderHome();
  renderWishlist();
}

function removeFromWishlist(title){
  saveWishlist(loadWishlist().filter(t => t !== title));
  renderWishlist();
}

function moveToCart(title){
  const book = bookByTitle(title);
  if (!book) return;
  const cart = loadCart();
  if (cart[title]) cart[title].qty += 1; else cart[title] = { price: book.price, qty: 1 };
  saveCart(cart);
  saveWishlist(loadWishlist().filter(t => t !== title));
  showToast(`“${title}” moved to cart`, "success");
  renderWishlist();
}

function moveAllToCart(){
  const list = loadWishlist();
  if (!list.length) return;
  const cart = loadCart();
  list.forEach(title => {
    const book = bookByTitle(title);
    if (!book) return;
    if (cart[title]) cart[title].qty += 1; else cart[title] = { price: book.price, qty: 1 };
  });
  saveCart(cart);
  saveWishlist([]);
  showToast("All wishlist items moved to your cart", "success");
  renderWishlist();
}

function renderWishlist(){
  const grid = document.getElementById("wishGrid");
  if (!grid) return;
  const items = loadWishlist().map(bookByTitle).filter(Boolean);
  document.getElementById("wishEmpty").style.display = items.length ? "none" : "block";
  document.getElementById("moveAllBtn").disabled = !items.length;
  grid.innerHTML = items.map(b => bookCard(b, "wishlist")).join("");
}

/* One delegated click handler for all card / cart buttons (safe with any title) */
document.addEventListener("click", e => {
  const t = e.target.closest("button");
  if (!t) return;
  const d = t.dataset;
  if (d.wish !== undefined) toggleWishlist(d.wish);
  else if (d.move !== undefined) moveToCart(d.move);
  else if (d.unwish !== undefined) removeFromWishlist(d.unwish);
  else if (d.add !== undefined) { const b = bookByTitle(d.add); if (b) addToCart(b.title, b.price); }
  else if (d.qty !== undefined) changeQuantity(d.title, Number(d.qty));
  else if (d.remove !== undefined) removeFromCart(d.remove);
  else if (d.reorder !== undefined) reorder(d.reorder);
});

/* Clear the red error state as soon as the user edits a field */
document.addEventListener("input", e => {
  const el = e.target;
  if (!el.matches || !el.matches("input,textarea,select")) return;
  el.classList.remove("invalid");
  const anchor = el.parentElement.classList.contains("pw-wrap") ? el.parentElement : el;
  const n = anchor.nextElementSibling;
  if (n && n.classList.contains("field-error")) n.textContent = "";
});

/* ---------- Checkout / Place order ---------- */
const SHIPPING_FLAT = 4.99;
const FREE_SHIPPING_OVER = 100;

function cartTotals(){
  const entries = Object.entries(loadCart());
  const subtotal = entries.reduce((sum, [, i]) => sum + i.price * i.qty, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FLAT;
  return { entries, subtotal, shipping, total: subtotal + shipping };
}

function renderCheckout(){
  const box = document.getElementById("orderSummary");
  if (!box) return;
  const { entries, subtotal, shipping, total } = cartTotals();
  const layout = document.getElementById("checkoutLayout");
  if (!entries.length){
    box.innerHTML = "";
    layout.style.display = "none";
    document.getElementById("checkoutEmpty").style.display = "block";
    return;
  }
  document.getElementById("checkoutEmpty").style.display = "none";
  layout.style.display = "grid";
  box.innerHTML = `
    <h3>Your order</h3>
    ${entries.map(([t, i]) => {
      const b = bookByTitle(t) || { color:"#6B2438" };
      return `<div class="mini-row">${coverSwatch(t, b.color, "", "sm")}
        <div><strong>${esc(t)}</strong><br><small>Qty ${i.qty}</small></div>
        <span>$${(i.price * i.qty).toFixed(2)}</span></div>`;
    }).join("")}
    <dl class="sum">
      <dt>Subtotal</dt><dd>$${subtotal.toFixed(2)}</dd>
      <dt>Shipping</dt><dd>${shipping ? "$" + shipping.toFixed(2) : "Free"}</dd>
      <dt class="grand">Total</dt><dd class="grand">$${total.toFixed(2)}</dd>
    </dl>`;
}

/* ---------- Accounts (browser-only demo: users stored in localStorage) ---------- */
function getUsers(){
  try { const u = JSON.parse(localStorage.getItem("users") || "[]"); return Array.isArray(u) ? u : []; }
  catch(e){ return []; }
}
function saveUsers(u){ try { localStorage.setItem("users", JSON.stringify(u)); } catch(e){} }

async function hashPwd(pwd){
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("leaflet:" + pwd));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
  } catch(e){ return "plain:" + pwd; }   // crypto.subtle unavailable (non-secure context)
}

function currentUser(){
  try {
    const email = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
    return email ? getUsers().find(u => u.email === email) || null : null;
  } catch(e){ return null; }
}

function refreshTopBar(){
  try { if (window.parent !== window && parent.frames["topFrame"]) parent.frames["topFrame"].location.reload(); } catch(e){}
}

function logout(){
  try { localStorage.removeItem("currentUser"); sessionStorage.removeItem("currentUser"); } catch(e){}
  refreshTopBar();
  try { if (window.parent !== window) { parent.frames["mainFrame"].location.href = "home.html"; return; } } catch(e){}
  window.location.href = "home.html";
}

function renderTopBar(){
  const u = currentUser();
  document.querySelectorAll(".guest-only").forEach(el => el.style.display = u ? "none" : "");
  const area = document.getElementById("userArea");
  if (!area) return;
  area.innerHTML = u
    ? `<span class="hello">Hi, ${esc(u.name.split(" ")[0])}</span>
       <a data-nav href="orders.html" target="mainFrame">My Orders</a>
       <a href="#" onclick="logout(); return false;">Logout</a>`
    : "";
  pullActive();
}

async function handleLogin(e){
  e.preventDefault();
  const id = document.getElementById("uname").value.trim().toLowerCase();
  const pwd = document.getElementById("pwd").value;
  const msg = document.getElementById("loginMsg");
  msg.style.color = "#9B2C2C";
  if (!id || !pwd){ msg.textContent = "Enter your e-mail (or name) and password."; return false; }
  const user = getUsers().find(u => u.email.toLowerCase() === id || u.name.toLowerCase() === id);
  if (!user){ msg.textContent = "No account found. Please register first."; return false; }
  if (user.pwdHash !== await hashPwd(pwd)){ msg.textContent = "Incorrect password."; return false; }
  // "Remember me": keep the login across browser restarts; otherwise only for this session.
  // (Only the e-mail is remembered — the password is never stored.)
  const remember = document.getElementById("remember").checked;
  try {
    localStorage.removeItem("currentUser"); sessionStorage.removeItem("currentUser");
    if (remember) { localStorage.setItem("currentUser", user.email); localStorage.setItem("savedLogin", user.email); }
    else { sessionStorage.setItem("currentUser", user.email); localStorage.removeItem("savedLogin"); }
  } catch(err){}
  refreshTopBar();
  msg.style.color = "#3E6B4E";
  msg.textContent = `Welcome back, ${user.name}! Taking you to the catalogue…`;
  setTimeout(() => { window.location.href = "catalogue.html"; }, 800);
  return false;
}

function prefillLogin(){
  const box = document.getElementById("uname"), chk = document.getElementById("remember");
  if (!box || !chk) return;
  try {
    const saved = localStorage.getItem("savedLogin");
    if (saved){ box.value = saved; chk.checked = true; }
  } catch(e){}
}

/* ---------- Checkout (step 1: delivery details) ---------- */
function prefillCheckout(){
  const u = currentUser();
  const layout = document.getElementById("checkoutLayout");
  const gate = document.getElementById("loginGate");
  if (!layout || !gate) return;
  if (!u){
    gate.style.display = "block";
    layout.style.display = "none";
    document.getElementById("checkoutEmpty").style.display = "none";
    return;
  }
  gate.style.display = "none";
  const set = (id, v) => { const el = document.getElementById(id); if (el && !el.value) el.value = v || ""; };
  set("cname", u.name); set("cemail", u.email); set("cphone", u.phone); set("caddr", u.address);
}

function placeOrder(e){            // "Continue to payment"
  e.preventDefault();
  if (!currentUser()) return false;
  let ok = true;
  const check = (id, test, msg) => {
    const val = document.getElementById(id).value.trim();
    if (!test(val)) { setError("err-" + id, msg); ok = false; } else setError("err-" + id, "");
  };
  check("cname",  v => /^[A-Za-z ]{3,}$/.test(v), "Enter your full name (letters only).");
  check("cemail", v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Enter a valid email address.");
  check("cphone", v => /^\d{10}$/.test(v), "Phone number must contain exactly 10 digits.");
  check("caddr",  v => v.length >= 10, "Enter your full delivery address.");
  check("ccity",  v => v.length >= 2, "Enter your city.");
  check("cpin",   v => /^\d{6}$/.test(v), "PIN code must be 6 digits.");
  if (!ok) return false;

  const { entries, subtotal, shipping, total } = cartTotals();
  if (!entries.length) return false;
  const pending = {
    name: document.getElementById("cname").value.trim(),
    email: document.getElementById("cemail").value.trim(),
    phone: document.getElementById("cphone").value.trim(),
    address: `${document.getElementById("caddr").value.trim()}, ${document.getElementById("ccity").value.trim()} - ${document.getElementById("cpin").value.trim()}`,
    items: entries.map(([title, i]) => ({ title, price: i.price, qty: i.qty })),
    subtotal, shipping, total
  };
  try { sessionStorage.setItem("pendingOrder", JSON.stringify(pending)); } catch(err){}
  window.location.href = "payment.html";
  return false;
}

/* ---------- Payment page (step 2: SIMULATED gateway — no real money moves) ---------- */
function getPending(){
  try { return JSON.parse(sessionStorage.getItem("pendingOrder") || "null"); } catch(e){ return null; }
}

function initPayment(){
  const box = document.getElementById("payBox");
  if (!box) return;
  const p = getPending();
  if (!currentUser() || !p){
    box.style.display = "none";
    document.getElementById("payGate").style.display = "block";
    return;
  }
  document.getElementById("payAmount").textContent = "$" + p.total.toFixed(2);
  document.getElementById("payTo").textContent = p.address;
  selectPayTab("card");
}

function setSteps(n){          // checkout progress: 1 Cart, 2 Delivery, 3 Payment, 4 Done
  document.querySelectorAll(".steps li").forEach((li, i) => {
    li.classList.toggle("done", i < n - 1 || n === 4);
    li.classList.toggle("active", i === n - 1 && n < 4);
  });
}

function selectPayTab(name){
  document.querySelectorAll(".pay-tab").forEach(t => t.classList.toggle("active", t.dataset.tab === name));
  document.querySelectorAll(".pay-panel").forEach(p => p.style.display = p.dataset.panel === name ? "block" : "none");
  document.getElementById("payMethod").value = name;
  setError("err-pay", "");
}

function formatCardInput(el){
  const d = el.value.replace(/\D/g, "").slice(0, 16);
  el.value = d.replace(/(.{4})/g, "$1 ").trim();
}

function validatePayment(method){
  const v = id => (document.getElementById(id).value || "").trim();
  if (method === "card"){
    if (!/^\d{16}$/.test(v("pcard").replace(/\s/g, ""))) return "Card number must be 16 digits.";
    if (!/^[A-Za-z ]{3,}$/.test(v("pholder"))) return "Enter the name on the card.";
    const m = v("pexp").match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
    if (!m) return "Expiry must be MM/YY.";
    const exp = new Date(2000 + Number(m[2]), Number(m[1]), 1);   // first day after expiry month
    if (exp <= new Date()) return "This card has expired.";
    if (!/^\d{3}$/.test(v("pcvv"))) return "CVV must be 3 digits.";
  } else if (method === "upi"){
    if (!/^[\w.\-]{2,}@[A-Za-z]{2,}$/.test(v("pupi"))) return "Enter a valid UPI id, e.g. name@upi.";
  } else if (method === "netbank"){
    if (!v("pbank")) return "Choose your bank.";
  }
  return "";
}

function payNow(e){
  e.preventDefault();
  const p = getPending(), user = currentUser();
  if (!p || !user) return false;
  const method = document.getElementById("payMethod").value;
  const err = validatePayment(method);
  setError("err-pay", err);
  if (err) return false;

  const btn = document.getElementById("payBtn");
  btn.disabled = true; btn.textContent = "Processing payment…";
  const card = (document.getElementById("pcard").value || "").replace(/\s/g, "");
  setTimeout(() => {
    // Demo rule: test card ending 0002 is declined so you can show the failure screen.
    if (method === "card" && card.endsWith("0002")){
      btn.disabled = false; btn.textContent = "Pay now";
      setError("err-pay", "Payment declined by the bank (test card). Try another method or card.");
      return;
    }
    const labels = { card:"Card", upi:"UPI", netbank:"Net banking", cod:"Cash on delivery" };
    const order = {
      id: "ORD" + Date.now().toString().slice(-8),
      date: new Date().toLocaleString(),
      userEmail: user.email,
      name: p.name, phone: p.phone, address: p.address,
      payment: labels[method],
      status: method === "cod" ? "Confirmed — pay on delivery" : "Paid",
      items: p.items, subtotal: p.subtotal, shipping: p.shipping, total: p.total
    };                                                // card details are never saved
    try {
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");
      orders.push(order);
      localStorage.setItem("orders", JSON.stringify(orders));
      sessionStorage.removeItem("pendingOrder");
    } catch(err){}
    saveCart({});
    document.getElementById("payBox").style.display = "none";
    setSteps(4);
    const conf = document.getElementById("orderConfirm");
    conf.style.display = "block";
    conf.innerHTML = `
      <div class="success-check">✓</div>
      <h2>Order placed — thank you, ${esc(order.name.split(" ")[0])}!</h2>
      <p class="muted">Order <strong>${order.id}</strong> · ${esc(order.status)}</p>
      <dl class="sum center">
        <dt>Amount</dt><dd>$${order.total.toFixed(2)}</dd>
        <dt>Payment method</dt><dd>${esc(order.payment)}</dd>
        <dt>Delivering to</dt><dd>${esc(order.address)}</dd>
      </dl>
      <p><a class="btn" href="orders.html">View my orders</a>
         <a class="btn secondary" href="catalogue.html">Continue shopping</a></p>`;
    window.scrollTo(0, 0);
  }, 1600);
  return false;
}

/* ---------- Order history ---------- */
function renderOrders(){
  const list = document.getElementById("ordersList");
  if (!list) return;
  const user = currentUser();
  if (!user){
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">🔐</div><h3>Please log in</h3>
      <p>Log in to see your order history.</p><a class="btn" href="login.html">Log in</a></div>`;
    return;
  }
  let all = [];
  try { all = JSON.parse(localStorage.getItem("orders") || "[]"); } catch(e){}
  const mine = all.filter(o => o.userEmail === user.email).reverse();
  if (!mine.length){
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><h3>No orders yet</h3>
      <p>Your placed orders will show up here.</p><a class="btn" href="catalogue.html">Browse books</a></div>`;
    return;
  }
  list.innerHTML = mine.map(o => `
    <article class="order-card">
      <header class="order-head">
        <div><strong>${esc(o.id)}</strong><small>${esc(o.date)}</small></div>
        <span class="order-status">${esc(o.status)}</span>
      </header>
      <div class="order-items">
        ${o.items.map(i => {
          const b = bookByTitle(i.title) || { color:"#6B2438" };
          return `<div class="mini-row">${coverSwatch(i.title, b.color, "", "sm")}
            <div><strong>${esc(i.title)}</strong><br><small>$${i.price.toFixed(2)} × ${i.qty}</small></div>
            <span>$${(i.price * i.qty).toFixed(2)}</span></div>`;
        }).join("")}
      </div>
      <div class="order-meta">
        <div><small>Payment method</small><strong>${esc(o.payment)}</strong></div>
        <div><small>Delivered to</small><strong>${esc(o.address)}</strong></div>
        <div><small>Shipping</small><strong>${o.shipping ? "$" + o.shipping.toFixed(2) : "Free"}</strong></div>
        <div><small>Total</small><strong class="big">$${o.total.toFixed(2)}</strong></div>
      </div>
      <footer><button type="button" class="btn secondary" data-reorder="${esc(o.id)}">Order again</button></footer>
    </article>`).join("");
}

function reorder(id){
  let all = [];
  try { all = JSON.parse(localStorage.getItem("orders") || "[]"); } catch(e){}
  const o = all.find(x => x.id === id);
  if (!o) return;
  const cart = loadCart();
  o.items.forEach(i => { if (cart[i.title]) cart[i.title].qty += i.qty; else cart[i.title] = { price: i.price, qty: i.qty }; });
  saveCart(cart);
  window.location.href = "cart.html";
}

/* ---------- Registration validation ---------- */
function populateDobSelects(){
  const day = document.getElementById("dobDay");
  const year = document.getElementById("dobYear");
  if(!day || !year) return;
  for(let d=1; d<=31; d++) day.innerHTML += `<option>${d}</option>`;
  const thisYear = new Date().getFullYear();
  for(let y=thisYear; y>=thisYear-80; y--) year.innerHTML += `<option>${y}</option>`;
}

function setError(id, message){
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message || "";
  const prev = el.previousElementSibling;
  const input = prev && (prev.matches("input,textarea,select") ? prev : prev.querySelector && prev.querySelector("input"));
  if (input) input.classList.toggle("invalid", !!message);
}

async function validateRegister(e){
  e.preventDefault();
  let ok = true;

  const name = document.getElementById("rname").value.trim();
  if(!/^[A-Za-z ]{6,}$/.test(name)){
    setError("err-rname", "Name must contain only letters and be at least 6 characters long.");
    ok = false;
  } else setError("err-rname", "");

  const pwd = document.getElementById("rpwd").value;
  if(pwd.length < 6){
    setError("err-rpwd", "Password must be at least 6 characters long.");
    ok = false;
  } else setError("err-rpwd", "");

  const email = document.getElementById("remail").value.trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    setError("err-remail", "Enter a valid email address, e.g. name@domain.com.");
    ok = false;
  } else setError("err-remail", "");

  const phone = document.getElementById("rphone").value.trim();
  if(!/^\d{10}$/.test(phone)){
    setError("err-rphone", "Phone number must contain exactly 10 digits.");
    ok = false;
  } else setError("err-rphone", "");

  const success = document.getElementById("regSuccess");
  success.style.color = "#3E6B4E";
  if (!ok){ success.textContent = ""; return false; }

  const users = getUsers();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())){
    setError("err-remail", "An account with this e-mail already exists. Please log in.");
    success.textContent = "";
    return false;
  }
  const sex = document.querySelector('input[name="sex"]:checked');
  users.push({
    name, email, phone,
    pwdHash: await hashPwd(pwd),
    sex: sex ? sex.value : "",
    dob: `${document.getElementById("dobDay").value} ${document.getElementById("dobMonth").value} ${document.getElementById("dobYear").value}`,
    langs: Array.from(document.querySelectorAll(".checks input:checked")).map(c => c.value),
    address: document.getElementById("raddr").value.trim(),
    created: new Date().toISOString()
  });
  saveUsers(users);
  success.textContent = "Registration successful! Taking you to the login page…";
  setTimeout(() => { window.location.href = "login.html"; }, 1200);
  return false;
}

/* ---------- Show / hide password (eye button) ---------- */
function addPasswordToggles(){
  document.querySelectorAll("input[type=password][data-toggle]").forEach(input => {
    if (input.parentElement.classList.contains("pw-wrap")) return;
    const wrap = document.createElement("span");
    wrap.className = "pw-wrap";
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pw-eye";
    btn.setAttribute("aria-label", "Show password");
    btn.textContent = "👁";
    btn.addEventListener("click", () => {
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.textContent = show ? "🙈" : "👁";
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
    wrap.appendChild(btn);
  });
}

/* ---------- Registration extras: password strength meter ---------- */
function bindRegisterExtras(){
  const p = document.getElementById("rpwd");
  const meter = document.getElementById("pwStrength");
  if (!p || !meter) return;
  p.addEventListener("input", () => {
    const v = p.value;
    let sc = 0;
    if (v.length >= 6) sc++;
    if (v.length >= 10) sc++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) sc++;
    if (/\d/.test(v)) sc++;
    if (/[^A-Za-z0-9]/.test(v)) sc++;
    const lvl = !v ? 0 : sc <= 2 ? 1 : sc <= 3 ? 2 : 3;
    meter.dataset.level = lvl;
    meter.querySelector("em").textContent = ["", "Weak", "Okay", "Strong"][lvl];
  });
}

/* ---------- Init per page ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const search = document.getElementById("catSearch");
  if (search){
    search.addEventListener("input", renderCatalogue);
    document.getElementById("catSort").addEventListener("change", renderCatalogue);
    document.getElementById("viewGrid").addEventListener("click", () => setView("grid"));
    document.getElementById("viewList").addEventListener("click", () => setView("list"));
    let v = "grid"; try { v = sessionStorage.getItem("catView") || "grid"; } catch(e){}
    setView(v);
  }
  renderCatalogue();
  renderHome();
  renderCart();
  renderWishlist();
  renderCheckout();
  prefillCheckout();
  initPayment();
  renderOrders();
  renderTopBar();
  prefillLogin();
  addPasswordToggles();
  populateDobSelects();
  bindRegisterExtras();
  updateBadges();

  document.querySelectorAll(".dept-count").forEach(el => {
    el.textContent = BOOKS.filter(b => !el.dataset.dept || b.dept === el.dataset.dept).length;
  });
  if (document.querySelector(".topbar, .sidebar")) pullActive(); else announcePage();
  const first = document.querySelector("form.stack input[type=text], form.stack input[type=email]");
  if (first && document.getElementById("uname") && !first.value) first.focus();
});
