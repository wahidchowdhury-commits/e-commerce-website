// /* PRODUCT DATA
   
var PRODUCTS = [
    { id: 1,  name: "Cotton Panjabi",       category: "Fashion", price: 899,  image: "images/panjabi.jpg"},
    { id: 2,  name: "Sports Sneakers",      category: "Fashion", price: 1499, image: "images/sneakers.jpg" },
    { id: 3,  name: "Leather Wallet",       category: "Fashion", price: 449,  image: "images/wallet.jpg" },
    { id: 4,  name: "Wireless Earbuds",     category: "Gadgets", price: 1299, image: "images/earbuds.jpg" },
    { id: 5,  name: "Smart Watch",          category: "Gadgets", price: 2499, image: "images/smartwatch.jpg" },
    { id: 6,  name: "Power Bank 10000mAh",  category: "Gadgets", price: 999,  image: "images/powerbank.jpg" },
    { id: 7,  name: "Ceramic Tea Set",      category: "Home",    price: 749,  image: "images/teaset.jpg" },
    { id: 8,  name: "Table Lamp",           category: "Home",    price: 599,  image: "images/lamp.jpg" },
    { id: 9,  name: "Darjeeling Tea 500g",  category: "Grocery", price: 350,  image: "images/tea.jpg" },
    { id: 10, name: "Mustard Oil 1L",       category: "Grocery", price: 185,  image: "images/mustard-oil.jpg" },
    { id: 11, name: "Basmati Rice 5kg",     category: "Grocery", price: 520,  image: "images/rice.jpg" },
    { id: 12, name: "Notebook Set (5)",     category: "Home",    price: 199,  image: "images/notebook.jpg"}
];

/* STATE */
var cart = {};
var activeCategory = "All";
var searchTerm = "";

/* LOAD SAVED CART */
try {
    cart = JSON.parse(localStorage.getItem("bm_cart") || "{}") || {};
} catch (e) {
    cart = {};
}

function saveCart() {
    try {
        localStorage.setItem("bm_cart", JSON.stringify(cart));
    } catch (e) {}
}

/* HELPERS */
function el(id) {
    return document.getElementById(id);
}

function formatMoney(n) {
    return "₹" + n.toLocaleString("en-IN");
}

function findProduct(id) {
    return PRODUCTS.filter(function (p) { return p.id == id; })[0];
}

function cartTotal() {
    return Object.keys(cart).reduce(function (sum, id) {
        return sum + findProduct(id).price * cart[id];
    }, 0);
}

function cartCount() {
    return Object.keys(cart).reduce(function (sum, id) {
        return sum + cart[id];
    }, 0);
}

/* PRODUCT IMAGE (photo, with emoji fallback if the file is missing) */
function productImage(p) {
    return '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy" data-emoji="' + p.emoji + '">';
}

function imageFallback(e) {
    var img = e.target;
    if (img.tagName === "IMG" && img.getAttribute("data-emoji")) {
        var span = document.createElement("span");
        span.textContent = img.getAttribute("data-emoji");
        img.replaceWith(span);
    }
}

/* RENDER: CATEGORIES */
function renderCategories() {
    var list = ["All"];

    PRODUCTS.forEach(function (p) {
        if (list.indexOf(p.category) < 0) list.push(p.category);
    });

    el("categories").innerHTML = list.map(function (c) {
        var cls = c === activeCategory ? "active" : "";
        return '<button class="' + cls + '" data-category="' + c + '">' + c + '</button>';
    }).join("");
}

/* RENDER: PRODUCT GRID */
function renderProducts() {
    var list = PRODUCTS.filter(function (p) {
        var matchCategory = activeCategory === "All" || p.category === activeCategory;
        var matchSearch = p.name.toLowerCase().indexOf(searchTerm) > -1;
        return matchCategory && matchSearch;
    });

    if (!list.length) {
        el("productGrid").innerHTML = '<div class="empty">No products found.</div>';
        return;
    }

    el("productGrid").innerHTML = list.map(function (p) {
        return '<div class="card">' +
            '<div class="card-image">' + productImage(p) + '</div>' +
            '<div class="card-info">' +
                '<small>' + p.category + '</small>' +
                '<div>' + p.name + '</div>' +
                '<div class="price">' + formatMoney(p.price) + '</div>' +
                '<button class="add-btn" data-add="' + p.id + '">Add to cart</button>' +
            '</div>' +
        '</div>';
    }).join("");
}

/* RENDER: CART */
function renderCart() {
    var ids = Object.keys(cart);

    if (!ids.length) {
        el("cartItems").innerHTML = '<div class="empty">Your cart is empty.</div>';
    } else {
        el("cartItems").innerHTML = ids.map(function (id) {
            var p = findProduct(id);
            return '<div class="cart-row">' +
                '<div class="cart-emoji">' + productImage(p) + '</div>' +
                '<div class="cart-name">' +
                    '<div>' + p.name + '</div>' +
                    '<small>' + formatMoney(p.price) + '</small>' +
                '</div>' +
                '<div class="qty">' +
                    '<button data-dec="' + id + '">−</button>' +
                    '<span>' + cart[id] + '</span>' +
                    '<button data-inc="' + id + '">+</button>' +
                '</div>' +
            '</div>';
        }).join("");
    }

    el("cartTotal").textContent = formatMoney(cartTotal());
    el("cartCount").textContent = cartCount();
    el("checkoutBtn").disabled = !ids.length;
    saveCart();
}

/* CART DRAWER OPEN / CLOSE */
function toggleDrawer(open) {
    el("drawer").classList.toggle("open", open);
    el("overlay").classList.toggle("open", open);
}

/* EVENTS: CATEGORY & SEARCH */
el("categories").onclick = function (e) {
    var c = e.target.getAttribute("data-category");
    if (c) {
        activeCategory = c;
        renderCategories();
        renderProducts();
    }
};

el("search").oninput = function () {
    searchTerm = this.value.toLowerCase().trim();
    renderProducts();
};

/* EVENTS: ADD TO CART */
el("productGrid").onclick = function (e) {
    var id = e.target.getAttribute("data-add");
    if (!id) return;

    cart[id] = (cart[id] || 0) + 1;
    renderCart();

    e.target.textContent = "Added ✓";
    setTimeout(function () {
        e.target.textContent = "Add to cart";
    }, 700);
};

/* EVENTS: CHANGE QUANTITY */
el("cartItems").onclick = function (e) {
    var inc = e.target.getAttribute("data-inc");
    var dec = e.target.getAttribute("data-dec");

    if (inc) cart[inc]++;

    if (dec) {
        cart[dec]--;
        if (cart[dec] <= 0) delete cart[dec];
    }

    if (inc || dec) renderCart();
};

/* EVENTS: DRAWER BUTTONS */
el("openCart").onclick = function () { toggleDrawer(true); };
el("closeCart").onclick = function () { toggleDrawer(false); };
el("overlay").onclick = function () { toggleDrawer(false); };

/* CHECKOUT */
el("checkoutBtn").onclick = function () {
    toggleDrawer(false);

    el("modalBox").innerHTML =
        '<h2>Delivery details</h2>' +
        '<input id="fullName" placeholder="Full name">' +
        '<input id="phone" type="tel" placeholder="Phone number">' +
        '<textarea id="address" rows="3" placeholder="Full address"></textarea>' +
        '<div class="total-row"><span>Pay on delivery</span><span>' + formatMoney(cartTotal()) + '</span></div>' +
        '<button class="primary-btn" id="placeOrder">Place order</button>' +
        '<button class="secondary-btn" id="cancelOrder">Cancel</button>';

    el("modal").classList.add("open");

    el("cancelOrder").onclick = function () {
        el("modal").classList.remove("open");
    };

    el("placeOrder").onclick = function () {
        var name = el("fullName").value.trim();
        var phone = el("phone").value.trim();
        var address = el("address").value.trim();

        if (!name || !phone || !address) {
            alert("Please fill in all the fields.");
            return;
        }

        var orderId = "BM" + Math.floor(100000 + Math.random() * 900000);
        var safeName = name.replace(/</g, "&lt;");

        cart = {};
        renderCart();

        el("modalBox").innerHTML =
            '<div class="success">' +
                '<div class="icon">🎉</div>' +
                '<h2>Order placed!</h2>' +
                '<p>Thank you, ' + safeName + '. Your order <b>' + orderId + '</b> will arrive in 3–5 days.</p><br>' +
                '<button class="primary-btn" id="doneBtn">Continue shopping</button>' +
            '</div>';

        el("doneBtn").onclick = function () {
            el("modal").classList.remove("open");
        };
    };
};

/* IMAGE ERROR FALLBACK (error events do not bubble, so use capture) */
el("productGrid").addEventListener("error", imageFallback, true);
el("cartItems").addEventListener("error", imageFallback, true);

/* INIT */
renderCategories();
renderProducts();
renderCart();